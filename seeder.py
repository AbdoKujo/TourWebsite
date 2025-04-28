#!/usr/bin/env python
import os
import django
import json
from pathlib import Path

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'website_cms.settings')
django.setup()

from django.utils.text import slugify
from cms.models import Page, Section, Element
from django.contrib.auth.models import User

def create_superuser():
    """Create a superuser if one doesn't exist"""
    if not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword'
        )
        print("Created superuser 'admin' with password 'adminpassword'")
    else:
        print("Superuser already exists")

def clear_database():
    """Clear existing data"""
    Element.objects.all().delete()
    Section.objects.all().delete()
    Page.objects.all().delete()
    print("Database cleared")

def create_base_pages():
    """Create base pages: Home, Services, Gallery, Contact"""
    # Create Home page
    home_page = Page.objects.create(
        slug='index',
        name='Home',
        type='base'
    )
    print(f'Created Home page')
    create_home_page_sections(home_page)
    
    # Create Services page
    about_page = Page.objects.create(
        slug='about',
        name='Services',
        type='base'
    )
    print(f'Created Services page')
    create_about_page_sections(about_page)
    
    # Create Gallery page
    gallery_page = Page.objects.create(
        slug='gallery',
        name='Gallery',
        type='base'
    )
    print(f'Created Gallery page')
    create_gallery_page_sections(gallery_page)
    
    # Create Contact page
    contact_page = Page.objects.create(
        slug='contact',
        name='Contact',
        type='base'
    )
    print(f'Created Contact page')
    create_contact_page_sections(contact_page)

def create_theme_pages():
    """Create theme pages for different destinations"""
    theme_pages = [
        'Tangier', 'Essaouira', 'Merzouga', 'Ouzoud', 'Ourika', 
        'Agafay', 'LaPalmeraie', 'HotAirBalloon', 'ParaglidingAguergour', 'Imlil', 'Immobilier'
    ]
    
    for page_name in theme_pages:
        slug = slugify(page_name)
        page = Page.objects.create(
            slug=slug,
            name=page_name,
            type='theme'
        )
        print(f'Created Theme page: {page_name}')
        create_theme_page_sections(page)

def create_home_page_sections(page):
    """Create sections for the Home page"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='text',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title='Leave Your Footprints',
        description='Discover the magic of Morocco, a land of breathtaking landscapes, rich culture, and unforgettable adventures. From the golden dunes of the Sahara to the vibrant souks of Marrakech, explore ancient medinas, majestic mountains, and stunning coastal towns. Experience the warmth of Moroccan hospitality, savor traditional cuisine, and embark on a journey full of history, adventure, and beauty.',
        order=0
    )
    
    # Create Header Button element
    Element.objects.create(
        section=header_section,
        title="let's see our services",
        description='',
        order=1
    )
    
    # Create Featured section
    featured_section = Section.objects.create(
        page=page,
        name='featured',
        type='image',
        order=1
    )
    
    # Create Featured title and subtitle elements
    Element.objects.create(
        section=featured_section,
        title='featured places',
        description='',
        json_content='{"type": "title"}',
        order=0
    )
    
    Element.objects.create(
        section=featured_section,
        title='know about some places before your travel',
        description='',
        json_content='{"type": "subtitle"}',
        order=1
    )
    
    # Create Featured items
    featured_items = [
        {
            'title': 'Agafay Desert',
            'description': 'Experience the stunning rocky desert landscape just outside Marrakech.',
            'src': '/static/images/Agafay2.jpg',
            'order': 2
        },
        {
            'title': 'Ourika',
            'description': 'Discover the lush valleys and waterfalls of the Ourika region.',
            'src': '/static/images/Ourika6.jpg',
            'order': 3
        },
        {
            'title': 'Parapont',
            'description': 'Soar above the Atlas Mountains with thrilling paragliding experiences.',
            'src': '/static/images/parapont1.jpg',
            'order': 4
        },
        {
            'title': 'Ouzoud',
            'description': 'Visit the magnificent Ouzoud waterfalls, one of Morocco\'s natural wonders.',
            'src': '/static/images/Ouzoud2.jpg',
            'order': 5
        },
        {
            'title': 'Air Balloon',
            'description': 'Float above Marrakech and enjoy breathtaking panoramic views at sunrise.',
            'src': '/static/images/AirBallon2.jpg',
            'order': 6
        },
        {
            'title': 'Imlil',
            'description': 'Trek through the High Atlas Mountains and experience Berber village life.',
            'src': '/static/images/imlil3.jpg',
            'order': 7
        }
    ]
    
    for item in featured_items:
        Element.objects.create(
            section=featured_section,
            title=item['title'],
            description=item['description'],
            src=item['src'],
            order=item['order']
        )
    
    # Create Services section
    services_section = Section.objects.create(
        page=page,
        name='services',
        type='text',
        order=2
    )
    
    # Create Services title and subtitle elements
    Element.objects.create(
        section=services_section,
        title='Our services',
        description='',
        json_content='{"type": "title"}',
        order=0
    )
    
    Element.objects.create(
        section=services_section,
        title='',
        description='',
        json_content='{"type": "subtitle"}',
        order=1
    )
    
    # Create Services items
    services_items = [
        {
            'title': 'Luxury Stay',
            'description': 'Relax in stylish desert lodges and enjoy breathtaking Agafay views.',
            'json_content': 'fas fa-hotel',
            'order': 2
        },
        {
            'title': 'Expert Travel Guide',
            'description': 'Explore Morocco with experienced guides for an unforgettable journey.',
            'json_content': 'fas fa-map-marked-alt',
            'order': 3
        },
        {
            'title': 'Best Prices Guaranteed',
            'description': 'Enjoy top-tier services at the most competitive rates.',
            'json_content': 'fas fa-money-bill',
            'order': 4
        }
    ]
    
    for item in services_items:
        Element.objects.create(
            section=services_section,
            title=item['title'],
            description=item['description'],
            json_content=item['json_content'],
            order=item['order']
        )
    
    # Create Testimonials section
    testimonials_section = Section.objects.create(
        page=page,
        name='testimonials',
        type='text',
        order=3
    )
    
    # Create Testimonials title and subtitle elements
    Element.objects.create(
        section=testimonials_section,
        title='testimonials',
        description='',
        json_content='{"type": "title"}',
        order=0
    )
    
    Element.objects.create(
        section=testimonials_section,
        title='what our clients say about us',
        description='',
        json_content='{"type": "subtitle"}',
        order=1
    )
    
    # Create Testimonials items
    testimonials_items = [
        {
            'title': 'Kevin Wilson',
            'description': 'An unforgettable experience! The views, the hospitality, and the adventure made our trip magical.',
            'src': '/static/images/test-1.jpg',
            'json_content': '{"trip": "Trip to Marrakech"}',
            'order': 2
        },
        {
            'title': 'Ben Davis',
            'description': 'Absolutely breathtaking! The desert, the food, and the peaceful vibes were beyond expectations.',
            'src': '/static/images/test-2.jpg',
            'json_content': '{"trip": "Trip to Marrakech"}',
            'order': 3
        },
        {
            'title': 'Jaura Jones',
            'description': 'A perfect escape! Loved the camel rides, the starry nights, and the warm hospitality.',
            'src': '/static/images/test-3.jpg',
            'json_content': '{"trip": "Trip to Marrakech"}',
            'order': 4
        }
    ]
    
    for item in testimonials_items:
        Element.objects.create(
            section=testimonials_section,
            title=item['title'],
            description=item['description'],
            src=item['src'],
            json_content=item['json_content'],
            order=item['order']
        )
    
    # Create Video section
    video_section = Section.objects.create(
        page=page,
        name='video',
        type='video',
        order=4
    )
    
    # Create Video element
    Element.objects.create(
        section=video_section,
        src='/static/videos/video-section.mp4',
        order=0
    )
    
    # Create Footer section for common elements
    footer_section = Section.objects.create(
        page=page,
        name='footer',
        type='text',
        order=5
    )
    
    # Create Footer elements
    Element.objects.create(
        section=footer_section,
        title='Marrakech<span>ActivitiesPortal</span>',
        description='Discover the breathtaking beauty of Morocco, from the Atlas Mountains to the golden dunes of Merzouga. Whether you seek adventure, culture, or relaxation, Morocco offers an unforgettable journey.',
        json_content='{"type": "logo"}',
        order=0
    )
    
    Element.objects.create(
        section=footer_section,
        title='Follow us on:',
        description='',
        json_content='{"type": "social_title"}',
        order=1
    )
    
    social_links = [
        {
            'title': 'facebook',
            'src': 'https://www.facebook.com/profile.php?id=100066894364180',
            'order': 2
        },
        {
            'title': 'instagram',
            'src': 'https://www.instagram.com/p/DGjfRSxtum4/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
            'order': 3
        },
        {
            'title': 'google',
            'src': 'mailto:moubela276@gmail.com',
            'order': 4
        }
    ]
    
    for item in social_links:
        Element.objects.create(
            section=footer_section,
            title=item['title'],
            src=item['src'],
            json_content='{"type": "social_link"}',
            order=item['order']
        )
    
    Element.objects.create(
        section=footer_section,
        title='Popular Places:',
        description='',
        json_content='{"type": "places_title"}',
        order=5
    )
    
    popular_places = [
        {'title': 'Imlil – Hike the Atlas Mountains', 'src': '#', 'order': 6},
        {'title': 'La Palmeraie – Explore the palm oasis', 'src': '#', 'order': 7},
        {'title': 'Agafay – Experience the rocky desert', 'src': '#', 'order': 8},
        {'title': 'Air Balloon – Enjoy breathtaking aerial views', 'src': '#', 'order': 9},
        {'title': 'Paragliding – Soar above stunning landscapes', 'src': '#', 'order': 10},
        {'title': 'Ouzoud – Visit the majestic waterfalls', 'src': '#', 'order': 11},
        {'title': 'Merzouga – Ride camels over golden dunes', 'src': '#', 'order': 12},
        {'title': 'Essaouira – Enjoy coastal beauty & surfing', 'src': '#', 'order': 13},
        {'title': 'Ourika – Discover scenic valley retreats', 'src': '#', 'order': 14}
    ]
    
    for item in popular_places:
        Element.objects.create(
            section=footer_section,
            title=item['title'],
            src=item['src'],
            json_content='{"type": "popular_place"}',
            order=item['order']
        )
    
    Element.objects.create(
        section=footer_section,
        title='Subscribe for Newsletter!',
        description='',
        json_content='{"type": "newsletter_title"}',
        order=15
    )

def create_about_page_sections(page):
    """Create sections for the Services (About) page"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='text',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title='Services',
        description='Escape to the stunning Agafay Desert, a hidden gem near Marrakech. Experience breathtaking landscapes, luxury desert camps, and unforgettable adventures under the starry sky. Discover the magic of Agafay today!',
        order=0
    )
    
    # Create About section
    about_section = Section.objects.create(
        page=page,
        name='about',
        type='image',
        order=1
    )
    
    # Create About elements
    about_items = [
        {
            'title': 'Ouzoud',
            'description': 'Experience the breathtaking beauty of Ouzoud Waterfalls, where cascading waters and lush landscapes create the perfect escape into nature.',
            'src': '/static/images/Ouzoud8.jpg',
            'json_content': '{"link": "theme/ouzoud", "link_text": "Read More"}',
            'order': 0
        },
        {
            'title': 'La Palmeraie',
            'description': 'Experience the beauty of Marrakech\'s palm groves with a serene camel ride, immersing yourself in nature and tradition.',
            'src': '/static/images/LaPalmaraie9.jpg',
            'json_content': '{"link": "theme/lapalmeraie", "link_text": "Read More"}',
            'order': 1
        },
        {
            'title': 'Agafay',
            'description': 'Explore the vibrant streets of Marrakech, from the bustling souks to the stunning palaces, and immerse yourself in the heart of Moroccan culture.',
            'src': '/static/images/Agafay8.jpg',
            'json_content': '{"link": "theme/agafay", "link_text": "Read More"}',
            'order': 2
        },
        {
            'title': 'Ourika',
            'description': 'Escape to the serene Ourika Valley, where lush greenery, Berber villages, and refreshing waterfalls await just outside Marrakech.',
            'src': '/static/images/Ourika8.jpg',
            'json_content': '{"link": "theme/ourika", "link_text": "Read More"}',
            'order': 3
        },
        {
            'title': 'Essaouira',
            'description': 'Breathe in the fresh ocean air as you wander through Essaouira\'s charming medina, discovering its rich history and coastal beauty.',
            'src': '/static/images/assaouira7.jpg',
            'json_content': '{"link": "theme/essaouira", "link_text": "Read More"}',
            'order': 4
        },
        {
            'title': 'Merzouga',
            'description': 'Venture deep into the Sahara with a Merzouga desert trip, riding camels over the dunes and sleeping under a sky full of stars.',
            'src': '/static/images/Merzouga1.jpg',
            'json_content': '{"link": "theme/merzouga", "link_text": "Read More"}',
            'order': 5
        },
        {
            'title': 'Hot Air Balloon',
            'description': 'Soar above the breathtaking landscapes of Marrakech at sunrise and witness a panoramic view like no other.',
            'src': '/static/images/AirBallon7.jpg',
            'json_content': '{"link": "theme/hotairballoon", "link_text": "Read More"}',
            'order': 6
        },
        {
            'title': 'Immobilier',
            'description': 'Explore the dynamic real estate market in Morocco, where you can find a diverse range of properties, from charming traditional homes to modern developments, offering excellent investment opportunities in a vibrant and growing market.',
            'src': '/static/images/immobilier9.jpg',
            'json_content': '{"link": "theme/immobilier", "link_text": "Read More"}',
            'order': 7
        },
        {
            'title': 'Paragliding Aguergour',
            'description': 'Experience the thrill of paragliding in Morocco and enjoy breathtaking bird\'s-eye views of the stunning landscapes, from the Atlas Mountains to the beautiful coastlines.',
            'src': '/static/images/parapont8.webp',
            'json_content': '{"link": "theme/paraglidingaguergour", "link_text": "Read More"}',
            'order': 8
        },
        {
            'title': 'Imlil',
            'description': 'Discover the captivating beauty of Imlil, Morocco\'s mountain gem, where adventure meets breathtaking landscapes.',
            'src': '/static/images/imlil1.jpg',
            'json_content': '{"link": "theme/imlil", "link_text": "Read More"}',
            'order': 9
        },
        {
            'title': 'Tangier',
            'description': 'Discover the vibrant culture of Tangier on a guided tour, where you can explore historic sites, bustling markets, and stunning coastal views, all while immersing yourself in the city\'s rich history and unique charm.',
            'src': '/static/images/tangier7.jpg',
            'json_content': '{"link": "theme/tangier", "link_text": "Read More"}',
            'order': 10
        }
    ]
    
    for item in about_items:
        Element.objects.create(
            section=about_section,
            title=item['title'],
            description=item['description'],
            src=item['src'],
            json_content=item['json_content'],
            order=item['order']
        )
    
    # Create Facts section
    facts_section = Section.objects.create(
        page=page,
        name='facts',
        type='json',
        order=2
    )
    
    # Create Facts title elements
    Element.objects.create(
        section=facts_section,
        title='FUN FACTS',
        description='',
        json_content='{"type": "title"}',
        order=0
    )
    
    Element.objects.create(
        section=facts_section,
        title='DISCOVER SOME FACTS ABOUT OUR SERVICES',
        description='',
        json_content='{"type": "subtitle"}',
        order=1
    )
    
    # Create Facts element
    facts_json = {
        'items': [
            {
                'icon': 'fas fa-map-marker-alt',
                'title': '50+',
                'text': 'Destinations Covered'
            },
            {
                'icon': 'fas fa-globe',
                'title': '1,000+',
                'text': 'Happy Travelers'
            },
            {
                'icon': 'fas fa-car',
                'title': '300+',
                'text': 'Tours Organized'
            },
            {
                'icon': 'fas fa-star',
                'title': '100%',
                'text': 'Customer Satisfaction'
            }
        ]
    }
    
    Element.objects.create(
        section=facts_section,
        json_content=json.dumps(facts_json),
        order=2
    )

def create_gallery_page_sections(page):
    """Create sections for the Gallery page"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='text',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title='Gallery',
        description='Discover the magic of Morocco, a land of breathtaking landscapes, rich culture, and unforgettable adventures. From the golden dunes of the Sahara to the vibrant souks of Marrakech, explore ancient medinas, majestic mountains, and stunning coastal towns. Experience the warmth of Moroccan hospitality, savor traditional cuisine, and embark on a journey full of history, adventure, and beauty.',
        order=0
    )
    
    # Create Gallery section
    gallery_section = Section.objects.create(
        page=page,
        name='gallery',
        type='image',
        order=1
    )
    
    # Create Gallery elements
    gallery_items = [
        {'src': '/static/images/gallery-1.jpg', 'title': 'Gallery Image 1', 'order': 0},
        {'src': '/static/images/gallery-2.jpg', 'title': 'Gallery Image 2', 'order': 1},
        {'src': '/static/images/gallery-3.jpg', 'title': 'Gallery Image 3', 'order': 2},
        {'src': '/static/images/assaouira5.jpg', 'title': 'Essaouira View', 'order': 3},
        {'src': '/static/images/assaouira6.jpg', 'title': 'Essaouira Beach', 'order': 4},
        {'src': '/static/images/assaouira4.jpg', 'title': 'Essaouira Port', 'order': 5},
        {'src': '/static/images/parapont4.jpg', 'title': 'Paragliding Experience', 'order': 6},
        {'src': '/static/images/parapont6.jpg', 'title': 'Paragliding View', 'order': 7},
        {'src': '/static/images/parapont7.jpg', 'title': 'Paragliding Adventure', 'order': 8},
        {'src': '/static/images/Ourika5.jpg', 'title': 'Ourika Valley', 'order': 9},
        {'src': '/static/images/Ouzoud4.jpg', 'title': 'Ouzoud Waterfalls', 'order': 10},
        {'src': '/static/images/Ourika6.jpg', 'title': 'Ourika Landscape', 'order': 11}
    ]
    
    for item in gallery_items:
        Element.objects.create(
            section=gallery_section,
            title=item.get('title', ''),
            src=item['src'],
            order=item['order']
        )

def create_contact_page_sections(page):
    """Create sections for the Contact page"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='text',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title='Contact',
        description='Get in touch with us! We\'d love to hear from you. Whether you have questions, feedback, or need assistance, please reach out, and our team will be happy to help you.',
        order=0
    )
    
    # Create Contact section
    contact_section = Section.objects.create(
        page=page,
        name='contact',
        type='form',
        order=1
    )
    
    # Create Contact title elements
    Element.objects.create(
        section=contact_section,
        title='contact us',
        description='',
        json_content='{"type": "title"}',
        order=0
    )
    
    Element.objects.create(
        section=contact_section,
        title='get in touch with us',
        description='',
        json_content='{"type": "subtitle"}',
        order=1
    )
    
    # Create Contact elements
    contact_json = {
        'form': {
            'fields': [
                {'name': 'name', 'type': 'text', 'label': 'Your name', 'required': True},
                {'name': 'email', 'type': 'email', 'label': 'Your email', 'required': True},
                {'name': 'message', 'type': 'textarea', 'label': 'Your message', 'required': True}
            ],
            'submit_text': 'Send message',
            'whatsapp_number': '212643562320'
        },
        'contact_info': [
            {
                'icon': 'fa fa-phone-alt',
                'title': 'Phone',
                'content': '+212643562320'
            },
            {
                'icon': 'fa fa-map-marked-alt',
                'title': 'Address',
                'content': 'Rue Mohammed V, 2ème étage, n°10, Immeuble royal Air Maroc guilez',
                'link': 'https://maps.app.goo.gl/fdoKHvVYEAToYJk98'
            },
            {
                'icon': 'fa fa-envelope',
                'title': 'Message',
                'content': 'moubela276@gmail.com'
            }
        ]
    }
    
    Element.objects.create(
        section=contact_section,
        json_content=json.dumps(contact_json),
        order=2
    )

def create_theme_page_sections(page):
    """Create sections for theme pages"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='image',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title=page.name,
        description=f'Experience the beauty of {page.name}, one of Morocco\'s most enchanting destinations.',
        src=f'/static/images/{page.slug.lower()}1.jpg',
        order=0
    )
    
    # Create Description section
    description_section = Section.objects.create(
        page=page,
        name='description',
        type='text',
        order=1
    )
    
    # Create Description elements
    Element.objects.create(
        section=description_section,
        title=f'{page.name} Experience',
        description=f'Discover the enchanting beauty of {page.name}, a breathtaking destination in Morocco known for its stunning landscapes and vibrant culture.',
        order=0
    )
    
    # Create About Trip section
    about_trip_section = Section.objects.create(
        page=page,
        name='about_trip',
        type='text',
        order=2
    )
    
    # Create About Trip elements
    Element.objects.create(
        section=about_trip_section,
        title='About This Trip',
        description=f'This {page.name} adventure offers a perfect blend of history, nature, and culture, making it an unforgettable journey through one of Morocco\'s most iconic destinations.',
        json_content=json.dumps({
            'highlights': [
                f'{page.name}: Discover the charm of this destination.',
                'Explore the cultural and spiritual heart of Morocco.',
                'Enjoy excursions through breathtaking landscapes.',
                'Experience local traditions and visit historical landmarks.',
                'Cultural Immersion: Shop in lively souks and visit museums.'
            ]
        }),
        order=0
    )
    
    # Create Gallery section
    gallery_section = Section.objects.create(
        page=page,
        name='gallery',
        type='image',
        order=3
    )
    
    # Create Gallery elements (3 images per theme)
    for i in range(1, 4):
        Element.objects.create(
            section=gallery_section,
            title=f'{page.name} Image {i}',
            src=f'/static/images/{page.slug.lower()}{i}.jpg',
            order=i-1
        )
    
    # Create Booking section
    booking_section = Section.objects.create(
        page=page,
        name='booking',
        type='form',
        order=4
    )
    
    # Create Booking elements
    booking_json = {
        'form': {
            'fields': [
                {'name': 'name', 'type': 'text', 'label': 'Full Name', 'required': True},
                {'name': 'email', 'type': 'email', 'label': 'Email', 'required': True},
                {'name': 'phone', 'type': 'tel', 'label': 'Phone Number', 'required': True},
                {'name': 'date', 'type': 'date', 'label': 'Trip Date', 'required': True},
                {'name': 'guests', 'type': 'select', 'label': 'Number of Guests', 'options': ['1', '2', '3', '4', '5+'], 'required': True},
                {'name': 'message', 'type': 'textarea', 'label': 'Special Requests', 'required': False}
            ],
            'submit_text': 'Book Now',
            'whatsapp_number': '212643562320'
        },
        'price': '90€ per person'
    }
    
    
    Element.objects.create(
        section=booking_section,
        title='Book This Trip',
        json_content=json.dumps(booking_json),
        order=0
    )

def main():
    """Main function to seed the database"""
    print("Starting database seeding...")
    
    # Create superuser
    create_superuser()
    
    # Clear database
    clear_database()
    
    # Create pages and content
    create_base_pages()
    create_theme_pages()
    
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    main()
