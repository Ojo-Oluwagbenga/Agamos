from rest_framework import views, viewsets, permissions, status
from rest_framework.response import Response
from .models import SiteSetting, Testimonial
from .serializers import SiteSettingSerializer, TestimonialSerializer

class PublicCmsOverviewView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        site_settings = SiteSetting.get_settings()
        testimonials = Testimonial.objects.filter(is_featured=True).order_by('display_order', '-created_at')

        return Response({
            'settings': SiteSettingSerializer(site_settings).data,
            'testimonials': TestimonialSerializer(testimonials, many=True).data,
        })


class AdminSiteSettingView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        site_settings = SiteSetting.get_settings()
        return Response(SiteSettingSerializer(site_settings).data)

    def put(self, request):
        site_settings = SiteSetting.get_settings()
        serializer = SiteSettingSerializer(site_settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminTestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all().order_by('display_order', '-created_at')
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAdminUser]
