from django.urls import path

from .views import FeedbackInitialResponseView, FeedbackView

urlpatterns = [
    path("", FeedbackView.as_view(), name="feedback"),
    path("initial-response/", FeedbackInitialResponseView.as_view(), name="initial_response"),
]
