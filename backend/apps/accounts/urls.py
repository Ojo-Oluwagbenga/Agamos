from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    GoogleAuthView,
    UserProfileView,
    ForgotPasswordView,
    ResetPasswordConfirmView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('google/', GoogleAuthView.as_view(), name='auth_google'),
    path('profile/', UserProfileView.as_view(), name='auth_profile'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('reset-password/', ResetPasswordConfirmView.as_view(), name='auth_reset_password'),
]
