import logging
import os

from courses.models import (Course, CourseMembership, CourseMilestone,
                            CourseMilestoneTemplate, CourseSubmission)
from django.db import transaction
from openai import OpenAI
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.ui import WebDriverWait

from pigeonhole.common.constants import COURSE, CREATOR, ID, INITIAL_RESPONSE, MILESTONE, NAME, QUESTION
from pigeonhole.common.parsers import to_base_json
from users.logic import user_to_json
from users.models import User

from .models import FeedbackInitialResponse

logger = logging.getLogger("main")

## TODO: this is only a temporary implemention. Should not rely on webscraping in the long run.
def answer_reflection(driver, element_class, reflection):
    text_questions = driver.find_element(By.CLASS_NAME, element_class)
    text_questions.clear()
    text_questions.send_keys(reflection)

    return driver


def submit(driver, element_class):
    driver.find_element(By.CLASS_NAME, element_class).click()
    return driver


def get_result(driver, element_class):
    result = driver.find_element(By.CLASS_NAME, element_class).get_attribute("value")
    return result


# Returns a two element array of string containing HTML code
# First element contains the HTML of inline annotated reflection
# Segments of text to be highlighted are enclosed by <span> tags with the type of highlight found within the span's class.
# Classes of highlights include context, challenge, affect, modall, epistemic, link2me, change, metrics

# Second element contains the HTML of feedback for the student, provided in a two panel view


def analyse(text):

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    text_question_element_class = "ql-editor"
    submit_element_class = "btn-lg"

    url = "https://acawriter-demo.utscic.edu.au/demo"
    coreDriver = webdriver.Chrome(options=chrome_options)
    coreDriver.get(url)

    select_element = coreDriver.find_element(By.ID, "grammar")
    select_object = Select(select_element)
    select_object.select_by_visible_text("Pharmacy")
    driver = answer_reflection(coreDriver, text_question_element_class, text)
    driver = submit(driver, submit_element_class)
    element = WebDriverWait(driver=driver, timeout=60).until(
        EC.invisibility_of_element((By.CLASS_NAME, "nprogress-busy"))
    )

    element = driver.find_element(
        By.XPATH, "//div[contains(@class, 'col-md-12 wrapper')]"
    )
    results = []
    inlineFeedback = element.get_attribute("innerHTML")

    results.append(inlineFeedback)  # Inline text feedback

    element = driver.find_element(By.ID, "feedback")
    panelFeedback = element.get_attribute("innerHTML")

    # Changing name of analyser
    panelFeedback = panelFeedback.replace("AcaWriter", "Reflection Analyser")

    # Removing ineffective feedback
    panelFeedback = panelFeedback.replace(
        """<li class="col-md-12 p-2"><span class="text-danger"> While it appears that you’ve reported on how you would change/prepare for the future, you don’t seem to have reported first on what you found challenging. Perhaps you’ve reflected only on the positive aspects in your report?. </span></li>""",
        "",
    )
    results.append(panelFeedback)  # Panel text feedback

    coreDriver.close()
    return results


# Returns response from ChatGPT in a single string, which might contain newlines.

def askChatGPT(text):

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Text prompt to generate feedback for the given reflection text
    prompt = "You are an educator with 30 years of education experience in guiding students through reflective learning." + \
            "Use the following step-by-step instructions to grade the given reflection and give feedback directed to the student, using only plaintext without any styling:" +\
            "Step 1) Analyse and grade the reflection by each stage of reflection using the following reflective writing assessment rubrics. Each section is worth up to 2 marks. A score of 2 should only be given with sufficient details and elaboration from the student." + \
            "<Rubrics Start>" + \
            "Rubrics:" + \
            "Stage 1. Returning to Experience: Statement provides description of the task chronologically and is clear of any judgements" + \
            "Stage 2. Attending to Feelings: Statement conveys personal feelings, thoughts (positive and or negative) of the experience and relates to future personal learning" + \
            "Stage 3. Integration: Statement clearly provides evidence of integration of prior knowledge, feelings, or attitudes with new knowledge, feelings, or attitudes, thus arriving at new perspectives." + \
            "Stage 4. Appropriation: Statement clearly shows evidence that inferences have been made using their own prior knowledge and previous experience throughout the task" + \
            "Stage 5. Outcomes of Reflection: Statement clearly shows evidence of reflection and clearly states: (1) a change in behaviour or development of new perspectives as a result of the task; (2) ability to reflect on own task, apply new knowledge feelings, thoughts, opinions to enhance new future experiences; and (3) examples" + \
            "Additional Stage. Readability and Accuracy: Clear, engaging, accurate and comprehensive text." + \
            "<Rubrics End>" + \
            "Step 2) Display the results by each grading category. For each category, briefly explain what was done well, and if a full score of 2 was not obtained, add some suggestions on how to improve to get a better score." + \
            "Step 3) Tally the overall grade and give an overall summary."

    query = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system", 
                "content": prompt
            },
            {
                "role": "user", 
                "content": text
            }],
        temperature=0.1
    )
  
    response = query.choices[0].message.content 

    # Log usage
    logger.info(query.usage) 

    return response 


@transaction.atomic
def createFeedbackInitialResponseIfNotExists(
    submission_id: int,
    requester: User,
    question: str,
    initial_response: str,
) -> tuple[FeedbackInitialResponse, bool]:
    
    try:
        submission = CourseSubmission.objects.select_related(
            "course",
            "milestone",
            "template"
        ).get(id=submission_id)

    except CourseSubmission.DoesNotExist as e:
        logger.warning(e)
        raise ValueError(f"No such submission found.")
    
    try:
        requester_membership = submission.course.coursemembership_set.get(user=requester)

    except CourseMembership.DoesNotExist as e:
        logger.warning(e)
        raise ValueError(f"No such user found in given course.")

    # Create new record only if none exists already
    new_initial_response, created = FeedbackInitialResponse.objects.get_or_create(
        course=submission.course,
        milestone=submission.milestone,
        template=submission.template,
        creator=requester_membership,
        question=question,
        defaults={
            "name": submission.template.__str__(), 
            "initial_response":initial_response,
        }
    )

    return new_initial_response, created

def feedback_initial_response_to_json(response: FeedbackInitialResponse) -> dict:
    data = to_base_json(response)

    data |= {
        NAME: response.name,
        QUESTION: response.question,
        INITIAL_RESPONSE: response.initial_response,
        CREATOR: user_to_json(response.creator.user)
        if response.creator is not None
        else None,
        MILESTONE: {ID: response.milestone.id, NAME: response.milestone.name}
        if response.milestone is not None
        else None,
        COURSE: {ID: response.course.id, NAME: response.course.name}
        if response.course is not None
        else None,
    }

    return data