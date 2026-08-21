import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.accounts.models import CustomerProfile
from apps.services.models import ServiceCategory, Service
from apps.availability.models import WeeklyAvailability, DayOfWeek
from apps.products.models import ProductCategory, Product
from apps.inventory.models import InventoryTransaction
from apps.cms.models import SiteSetting, Testimonial

User = get_user_model()

def seed_database():
    print("[*] Seeding AGAMOS luxury database...")

    # 1. Admin & Test Customer
    admin_user, created = User.objects.get_or_create(
        email='admin@agamos.com',
        defaults={
            'first_name': 'Agamos',
            'last_name': 'Administrator',
            'is_staff': True,
            'is_superuser': True,
            'role': User.Role.ADMIN,
        }
    )
    if created:
        admin_user.set_password('AgamosLuxury2026!')
        admin_user.save()
        CustomerProfile.objects.get_or_create(
            user=admin_user,
            defaults={'phone': '+2348000002426', 'address': '12A Victoria Island Luxury Boulevard, Lagos'}
        )
        print("  [+] Created Admin user: admin@agamos.com / AgamosLuxury2026!")

    test_customer, created = User.objects.get_or_create(
        email='client@agamos.com',
        defaults={
            'first_name': 'Victoria',
            'last_name': 'Adeyemi',
            'role': User.Role.CUSTOMER,
        }
    )
    if created:
        test_customer.set_password('AgamosLuxury2026!')
        test_customer.save()
        CustomerProfile.objects.get_or_create(
            user=test_customer,
            defaults={'phone': '+2348012345678', 'address': '4 Banana Island Road, Ikoyi, Lagos'}
        )
        print("  [+] Created Test Customer: client@agamos.com / AgamosLuxury2026!")

    # 2. Weekly Availability
    for day_code, _ in DayOfWeek.choices:
        if day_code == DayOfWeek.SUNDAY:
            # Sunday: 12pm - 6pm
            WeeklyAvailability.objects.get_or_create(
                day_of_week=day_code,
                defaults={
                    'open_time': '12:00:00',
                    'close_time': '18:00:00',
                    'slot_interval_minutes': 60,
                    'max_concurrent_clients': 1,
                    'is_active': True
                }
            )
        else:
            # Mon - Sat: 9am - 7pm
            WeeklyAvailability.objects.get_or_create(
                day_of_week=day_code,
                defaults={
                    'open_time': '09:00:00',
                    'close_time': '19:00:00',
                    'slot_interval_minutes': 30,
                    'max_concurrent_clients': 3,
                    'is_active': True
                }
            )
    print("  [+] Created Weekly Business Schedules (Mon-Sat 9AM-7PM, Sun 12PM-6PM)")

    # 3. Service Categories & Services
    cat_hair, _ = ServiceCategory.objects.get_or_create(
        name="Hair & Haute Coiffure",
        defaults={'display_order': 1, 'description': "Precision cuts, bespoke coloring, silk styling, and organic restorative hair therapies."}
    )
    cat_spa, _ = ServiceCategory.objects.get_or_create(
        name="Spa & Wellness Rituals",
        defaults={'display_order': 2, 'description': "Holistic body treatments, hydrotherapy, deep thermal massages, and 24K gold facial infusions."}
    )
    cat_nails, _ = ServiceCategory.objects.get_or_create(
        name="Nail Couture & Care",
        defaults={'display_order': 3, 'description': "Russian e-file manicures, handcrafted luxury gel extensions, and therapeutic foot soaks."}
    )
    cat_styling, _ = ServiceCategory.objects.get_or_create(
        name="Bespoke Styling & Image",
        defaults={'display_order': 4, 'description': "Editorial makeup, red-carpet hair styling, and private wardrobe image consultations."}
    )

    services_data = [
        {
            'category': cat_hair,
            'name': "The Royal Silk Press & Botanical Deep Hydration",
            'short_description': "A featherlight, glass-finish silk press paired with steam botanical moisture infusion.",
            'full_description': "Includes custom organic clarifying shampoo, keratin peptide strengthening mask under ozone micro-mist steam, precision split-end dusting, and a heat-shielded mirror-shine silk press finish.",
            'price': Decimal('45000.00'),
            'duration_minutes': 90,
            'buffer_time_minutes': 15,
            'is_featured': True,
        },
        {
            'category': cat_hair,
            'name': "Haute Couture Bridal & Gala Hair Artistry",
            'short_description': "Signature editorial sculpted updo or cascading Hollywood waves for unforgettable moments.",
            'full_description': "Includes detailed architectural hair structuring, luxury veil/tiara placement, anti-humidity micro-setting, and emergency bridal touch-up kit.",
            'price': Decimal('120000.00'),
            'duration_minutes': 150,
            'buffer_time_minutes': 30,
            'is_featured': True,
        },
        {
            'category': cat_spa,
            'name': "Agamos Signature 24K Pure Gold Facial Infusion",
            'short_description': "Cellular renewal treatment with authentic 24K gold leaf and collagen hyaluronic peptides.",
            'full_description': "Begins with double enzyme cleansing and microdermabrasion, followed by manual lymphatic facial massage and the application of pure 24-karat gold sheets sealed with cold LED light therapy.",
            'price': Decimal('75000.00'),
            'duration_minutes': 75,
            'buffer_time_minutes': 15,
            'is_featured': True,
        },
        {
            'category': cat_spa,
            'name': "Deep Thermal Hot Stone & Aromatherapy Therapy",
            'short_description': "Volcanic basalt stones combined with cold-pressed oud and neroli botanical elixirs.",
            'full_description': "Deep tension melting ritual utilizing heated volcanic stones along primary energy meridians, paired with custom aromatherapy oils to restore equilibrium.",
            'price': Decimal('60000.00'),
            'duration_minutes': 90,
            'buffer_time_minutes': 15,
            'is_featured': False,
        },
        {
            'category': cat_nails,
            'name': "Luxury Russian Manicure & Sculpted Gel Extensions",
            'short_description': "Immaculate dry e-file cuticle detailing with custom crystal-clear sculpted extensions.",
            'full_description': "Advanced diamond drill cuticle purification followed by apex-balanced builder gel sculpting, finished with custom luxury minimalist nail art and warm jojoba treatment.",
            'price': Decimal('38000.00'),
            'duration_minutes': 75,
            'buffer_time_minutes': 15,
            'is_featured': True,
        },
        {
            'category': cat_nails,
            'name': "Pedicure Deluxe & Dead Sea Salt Exfoliation",
            'short_description': "Sensory foot rejuvenation with mineral salt exfoliation, warm paraffin wrap, and callus treatment.",
            'full_description': "A rejuvenating foot bath infused with essential rose oil, followed by Dead Sea mineral scrub, intensive heel balm buffing, heated botanical paraffin boots, and high-shine buff.",
            'price': Decimal('32000.00'),
            'duration_minutes': 60,
            'buffer_time_minutes': 15,
            'is_featured': False,
        },
        {
            'category': cat_styling,
            'name': "VIP Red Carpet Image & Wardrobe Styling Consultation",
            'short_description': "Private 1-on-1 fashion aesthetic direction, silhouette mapping, and event curation.",
            'full_description': "Comprehensive styling consultation with our lead creative director in our VIP private suite. Covers color theory, bespoke silhouette curation, and garment fittings.",
            'price': Decimal('150000.00'),
            'duration_minutes': 120,
            'buffer_time_minutes': 30,
            'is_featured': True,
        },
    ]

    for s_data in services_data:
        s, _ = Service.objects.get_or_create(
            name=s_data['name'],
            defaults=s_data
        )
    print(f"  [+] Seeded {len(services_data)} Luxury Salon & Spa Services")

    # 4. Product Categories & Products
    p_cat_hair, _ = ProductCategory.objects.get_or_create(
        name="Hair Care & Elixirs",
        defaults={'description': "Salon-grade organic oils, peptide shampoos, and intensive hair repair masks."}
    )
    p_cat_skin, _ = ProductCategory.objects.get_or_create(
        name="Skincare & Serums",
        defaults={'description': "High-potency cellular serums, gold-infused concentrates, and rich moisture creams."}
    )
    p_cat_body, _ = ProductCategory.objects.get_or_create(
        name="Body & Fragrance",
        defaults={'description': "Artisanal body soufflés, fragrant bath oils, and exfoliating mineral polishes."}
    )
    p_cat_nail, _ = ProductCategory.objects.get_or_create(
        name="Nail Care & Oils",
        defaults={'description': "Nourishing cuticle nectars, strengthening base coats, and hand repair balms."}
    )

    products_data = [
        {
            'category': p_cat_hair,
            'name': "Agamos Imperial Oud & Gold Nourishing Hair Oil",
            'sku': "AGM-OIL-001",
            'short_description': "Pure cold-pressed argan oil infused with royal oud and 24K gold micro-flakes.",
            'description': "An ultra-luxurious hair elixir designed to seal moisture, eliminate frizz, and impart a luminous radiant shine with a captivating oriental oud aroma. Suitable for all hair textures.",
            'price': Decimal('28500.00'),
            'sale_price': None,
            'stock_quantity': 35,
            'low_stock_threshold': 5,
            'is_featured': True,
            'is_session_product': True,
        },
        {
            'category': p_cat_hair,
            'name': "Botanical Caviar Repair & Bond Restoring Hair Mask",
            'sku': "AGM-MSK-002",
            'short_description': "Intensive amino acid and green caviar reconstructive treatment for damaged hair.",
            'description': "Deeply penetrates the hair cortex to rebuild disulfide bonds, fortify tensile strength, and lock in long-lasting hydration. Free of sulfates, parabens, and synthetic silicones.",
            'price': Decimal('34000.00'),
            'sale_price': Decimal('31000.00'),
            'stock_quantity': 22,
            'low_stock_threshold': 5,
            'is_featured': True,
            'is_session_product': True,
        },
        {
            'category': p_cat_skin,
            'name': "24K Gold Cellular Renewal Peptide Face Serum",
            'sku': "AGM-SRM-003",
            'short_description': "A concentrated multi-peptide youth serum enriched with colloidal gold and niacinamide.",
            'description': "Formulated in Switzerland, this velvety serum stimulates collagen production, improves elasticity, reduces hyperpigmentation, and yields an instant dewy glass-skin finish.",
            'price': Decimal('52000.00'),
            'sale_price': None,
            'stock_quantity': 15,
            'low_stock_threshold': 4,
            'is_featured': True,
            'is_session_product': False,
        },
        {
            'category': p_cat_body,
            'name': "Damask Rose & Dead Sea Exfoliating Glow Polish",
            'sku': "AGM-SCR-004",
            'short_description': "Organic cane sugar and Dead Sea salt crystals immersed in organic rosehip oil.",
            'description': "Polishes away dead surface cells to reveal ultra-soft, radiant skin. Delicate notes of blooming Grasse rose petals and soothing sandalwood.",
            'price': Decimal('24000.00'),
            'sale_price': None,
            'stock_quantity': 28,
            'low_stock_threshold': 6,
            'is_featured': False,
            'is_session_product': True,
        },
        {
            'category': p_cat_body,
            'name': "Crème de Karité & Neroli Ultra-Hydrating Body Soufflé",
            'sku': "AGM-CRM-005",
            'short_description': "Whipped wild-harvested shea butter blended with organic neroli blossom oil.",
            'description': "Melt-into-skin body butter providing 48-hour intense moisture without greasiness. Imparts a sublime satin sheen and uplifting Mediterranean orange blossom fragrance.",
            'price': Decimal('26500.00'),
            'sale_price': None,
            'stock_quantity': 18,
            'low_stock_threshold': 5,
            'is_featured': True,
            'is_session_product': True,
        },
        {
            'category': p_cat_nail,
            'name': "Agamos Signature Golden Cuticle & Nail Recovery Nectar",
            'sku': "AGM-NAL-006",
            'short_description': "Nutrient-dense vitamin E, sweet almond, and jojoba cuticle revival formula with dropper.",
            'description': "Targeted therapy to heal cracked cuticles, promote strong nail plate growth, and prevent peeling. Fast-absorbing with subtle vanilla orchid notes.",
            'price': Decimal('14500.00'),
            'sale_price': None,
            'stock_quantity': 45,
            'low_stock_threshold': 8,
            'is_featured': False,
            'is_session_product': True,
        },
    ]

    for p_data in products_data:
        p, created = Product.objects.get_or_create(
            sku=p_data['sku'],
            defaults=p_data
        )
        if created:
            # Create initial inventory ledger
            InventoryTransaction.objects.create(
                product=p,
                transaction_type=InventoryTransaction.TransactionType.INITIAL,
                quantity_delta=p.stock_quantity,
                previous_stock=0,
                new_stock=p.stock_quantity,
                performed_by=admin_user,
                reason="Initial seed catalog inventory"
            )
    print(f"  [+] Seeded {len(products_data)} E-Commerce Beauty Products & Inventory Ledgers")

    # 5. Global Site Settings
    settings_obj = SiteSetting.get_settings()
    settings_obj.hero_headline = "The Sanctuary of Haute Beauty & Rejuvenation"
    settings_obj.hero_subheadline = "Indulge in couture hair artistry, restorative spa sanctuaries, and curated luxury cosmetics engineered for the modern connoisseur."
    settings_obj.contact_phone = "+234 800 242 6670"
    settings_obj.contact_email = "concierge@agamos.com"
    settings_obj.address = "12A Victoria Island Luxury Boulevard, Lagos, Nigeria"
    settings_obj.delivery_flat_fee = Decimal('3500.00')
    settings_obj.save()
    print("  [+] Configured Global Luxury Site Settings")

    # 6. Testimonials
    testimonials = [
        {
            'client_name': "Genevieve Nwosu",
            'client_title': "Vogue Africa Contributor & Stylist",
            'quote': "AGAMOS is redefining luxury personal care in West Africa. The precision of their silk press and the calming ambience of the private spa suites are unmatched anywhere in Lagos.",
            'rating': 5,
            'is_featured': True,
            'display_order': 1,
        },
        {
            'client_name': "Dr. Kemi Balogun",
            'client_title': "Dermatologist & Wellness Collector",
            'quote': "The 24K Gold Facial is nothing short of miraculous. The attention to skin physiology and the bespoke botanical serums leave your complexion visibly renewed for weeks.",
            'rating': 5,
            'is_featured': True,
            'display_order': 2,
        },
        {
            'client_name': "Chuka Eke",
            'client_title': "Creative Director, Maison Noir",
            'quote': "From seamless online booking to the discreet VIP suite service and rapid product courier, AGAMOS operates with Swiss precision and international luxury standards.",
            'rating': 5,
            'is_featured': True,
            'display_order': 3,
        }
    ]
    for t in testimonials:
        Testimonial.objects.get_or_create(
            client_name=t['client_name'],
            defaults=t
        )
    print(f"  [+] Seeded {len(testimonials)} Editorial Testimonials")

    print("\n[SUCCESS] AGAMOS Luxury Database Seeding Completed Successfully!")

if __name__ == '__main__':
    seed_database()
