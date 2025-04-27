"""
Django Project Setup Instructions

1. Create the Django project:
   django-admin startproject website_cms
   cd website_cms
   python manage.py startapp cms

2. Create the directory structure:
   mkdir -p static/css static/js static/images static/admin/css static/admin/js
   mkdir -p media/uploads
   mkdir -p templates/pages templates/dashboard templates/includes

3. Move static files:
   - Move all CSS files to static/css/
   - Move all JS files to static/js/
   - Move all images to static/images/

4. Install required packages:
   pip install django mysqlclient pillow

5. Configure MySQL database in settings.py:
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'website_cms',
           'USER': 'your_mysql_user',
           'PASSWORD': 'your_mysql_password',
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }

6. Create the database:
   mysql -u root -p
   CREATE DATABASE website_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   GRANT ALL PRIVILEGES ON website_cms.* TO 'your_mysql_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;

7. Run migrations:
   python manage.py makemigrations
   python manage.py migrate

8. Create a superuser:
   python manage.py createsuperuser

9. Run the development server:
   python manage.py runserver
"""
