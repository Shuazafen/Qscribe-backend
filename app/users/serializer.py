from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.bvn = validated_data.get('bvn', instance.bvn)
        instance.nin = validated_data.get('nin', instance.nin)
        instance.university = validated_data.get('university', instance.university)
        instance.facial_recognition_image = validated_data.get('facial_recognition_image', instance.facial_recognition_image)
        instance.id_card_image = validated_data.get('id_card_image', instance.id_card_image)
        instance.set_password(validated_data.get('password', instance.password))
        instance.save()
        return instance