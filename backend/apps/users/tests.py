from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


User = get_user_model()


class ProfileAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="profiletest",
            email="profile@test.com",
            phone="0200000000",
            full_name="Profile Test User",
            password="OldPassword123",
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_get_profile(self):
        response = self.client.get(
            "/api/auth/me/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["user"]["full_name"],
            "Profile Test User",
        )

        self.assertEqual(
            response.data["user"]["email"],
            "profile@test.com",
        )

    def test_update_profile(self):
        response = self.client.patch(
            "/api/auth/me/",
            {
                "full_name": "Updated Test User",
                "phone": "0200000001",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["user"]["full_name"],
            "Updated Test User",
        )

        self.assertEqual(
            response.data["user"]["phone"],
            "0200000001",
        )

    def test_duplicate_username_rejected(self):
        User.objects.create_user(
            username="existinguser",
            email="existing@test.com",
            phone="0200000002",
            full_name="Existing User",
            password="Password123",
        )

        response = self.client.patch(
            "/api/auth/me/",
            {
                "username": "existinguser",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_wrong_current_password_rejected(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "WrongPassword123",
                "new_password": "NewPassword123",
                "confirm_password": "NewPassword123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_mismatched_passwords_rejected(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "OldPassword123",
                "new_password": "NewPassword123",
                "confirm_password": "DifferentPassword123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_same_password_rejected(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "OldPassword123",
                "new_password": "OldPassword123",
                "confirm_password": "OldPassword123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_successful_password_change(self):
        response = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "OldPassword123",
                "new_password": "NewPassword123",
                "confirm_password": "NewPassword123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(
                "NewPassword123"
            )
        )