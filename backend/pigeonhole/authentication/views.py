from rest_framework_simplejwt.views import TokenViewBase
from .serializers import (
    GoogleLoginSerializer,
    FacebookLoginSerializer,
    PasswordLoginSerializer,
    AccessTokenRefreshSerializer,
    CheckAccountSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
)

# Create your views here.
class GoogleLoginView(TokenViewBase):
    serializer_class = GoogleLoginSerializer


class FacebookLoginView(TokenViewBase):
    serializer_class = FacebookLoginSerializer


class PasswordLoginView(TokenViewBase):
    serializer_class = PasswordLoginSerializer


class AccessTokenRefreshView(TokenViewBase):
    serializer_class = AccessTokenRefreshSerializer


class CheckAccountView(TokenViewBase):
    serializer_class = CheckAccountSerializer


class PasswordResetView(TokenViewBase):
    serializer_class = PasswordResetSerializer


class PasswordResetConfirmView(TokenViewBase):
    serializer_class = PasswordResetConfirmSerializer
