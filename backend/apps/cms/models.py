from django.db import models

class SiteSetting(models.Model):
    # Hero Section
    hero_headline = models.CharField(max_length=200, default="The Art of Rejuvenation & Haute Coiffure")
    hero_subheadline = models.TextField(default="Experience bespoke salon treatments, restorative spa rituals, and luxury beauty curated for the discerning individual.")
    hero_image = models.ImageField(upload_to='cms/', blank=True, null=True)
    
    # Brand Story / About
    about_title = models.CharField(max_length=200, default="Bespoke Luxury Crafted For Distinction")
    about_content = models.TextField(default="AGAMOS represents the pinnacle of salon, spa, and beauty experiences. Founded on the principle of timeless elegance, every ritual is executed with precision craftsmanship.")
    
    # Business Contacts
    contact_email = models.EmailField(default="concierge@agamos.com")
    contact_phone = models.CharField(max_length=30, default="+234 800 000 2426")
    address = models.TextField(default="12A Victoria Island Luxury Boulevard, Lagos, Nigeria")
    
    # Business Parameters
    delivery_flat_fee = models.DecimalField(max_digits=10, decimal_places=2, default=3500.00, help_text="Courier flat delivery fee in NGN")
    
    # Social Links
    social_instagram = models.URLField(blank=True, default="https://instagram.com/agamosluxury")
    social_facebook = models.URLField(blank=True, default="https://facebook.com/agamosluxury")
    social_tiktok = models.URLField(blank=True, default="https://tiktok.com/@agamosluxury")
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'

    def save(self, *args, **kwargs):
        # Singleton guarantee
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "AGAMOS Global Site Settings"


class Testimonial(models.Model):
    client_name = models.CharField(max_length=150)
    client_title = models.CharField(max_length=150, blank=True, help_text="e.g. Fashion Director, Creative Producer")
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    avatar = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    is_featured = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"{self.client_name} ({self.rating}★)"
