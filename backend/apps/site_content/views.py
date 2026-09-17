from rest_framework.generics import ListAPIView

from .models import SiteImage
from .serializers import SiteImageSerializer


class SiteImageListView(ListAPIView):
    queryset = SiteImage.objects.all()
    serializer_class = SiteImageSerializer