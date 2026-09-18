from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from .models import SiteImage
from .serializers import SiteImageSerializer


class SiteImageListView(ListAPIView):
    permission_classes = [AllowAny]

    queryset = SiteImage.objects.all()
    serializer_class = SiteImageSerializer