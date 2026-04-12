# MCR file header: Backend\mcr\apps.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.


from django.apps import AppConfig


class McrConfig(AppConfig):
    default_auto_field = "django.db.models.AutoField"
    name = 'mcr'
