from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from .tokens import account_activation_token
from rest_framework.decorators import api_view, permission_classes
from django.core.mail import EmailMessage
from .models import Account
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework.generics import RetrieveAPIView
from .serializers import AccountSerializer



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_email(request):
    if not request.user.is_email_verified:
        current_site = get_current_site(request)
        user = request.user
        email = request.user.email
        subject = "Verify Email"
        message = render_to_string('user/verify_email_message.html', {
            'request': request,
            'user': user,
            'domain': current_site.domain,
            'uid':urlsafe_base64_encode(force_bytes(user.pk)),
            'token':account_activation_token.make_token(user),
        })
        email = EmailMessage(
            subject, message, to=[email]
        )
        email.content_subtype = 'html'
        email.send()
        return Response({'detail': 'Confirmation email was sent!'}, status=status.HTTP_200_OK)
    else:
        return Response({'detail': 'Email was already confirmed!', 'redirect': 'home-page'}, status=status.HTTP_308_PERMANENT_REDIRECT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_email_confirm(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = Account.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, Account.DoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.is_email_verified = True
        user.save()
        return Response({'detail': 'Email was confirmed!', 'redirect': 'home-page'}, status=status.HTTP_308_PERMANENT_REDIRECT)
    else:
        return Response({'detail': 'Invalid email!'}, status=status.HTTP_204_NO_CONTENT)
    
    
@api_view(['Get'])
@permission_classes([IsAuthenticated])
def getUserAccount(request):
    user = request.user
    serializer = AccountSerializer(user)
    return Response(serializer.data)