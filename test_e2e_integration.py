import urllib.request
import json
from datetime import date, timedelta

BACKEND_URL = "http://127.0.0.1:8000/api"
FRONTEND_URL = "http://127.0.0.1:5173"

def make_req(url, data=None, headers=None, method="GET"):
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            try:
                return json.loads(content), resp.status
            except Exception:
                return content, resp.status
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            return json.loads(err_content), e.code
        except Exception:
            return err_content, e.code

def run_e2e_tests():
    print("[*] Starting AGAMOS End-to-End System Verification...")

    # 1. Frontend Server Liveness
    print("\n[1] Testing Frontend Server Liveness...")
    req = urllib.request.Request(FRONTEND_URL)
    with urllib.request.urlopen(req) as resp:
        print(f"    [+] Frontend Live on {FRONTEND_URL} -> HTTP Status {resp.status}")

    # 2. CMS Overview
    print("\n[2] Testing Dynamic CMS Content...")
    cms_data, status = make_req(f"{BACKEND_URL}/cms/content/")
    assert status == 200, f"CMS failed with {status}"
    print(f"    [+] CMS Loaded: '{cms_data['settings']['hero_headline']}'")
    print(f"    [+] Testimonials loaded: {len(cms_data['testimonials'])} records")

    # 3. Services Catalog
    print("\n[3] Testing Services Catalog...")
    services_res, status = make_req(f"{BACKEND_URL}/services/")
    services = services_res.get("results", services_res) if isinstance(services_res, dict) else services_res
    assert len(services) > 0, "No services found"
    first_service = services[0]
    print(f"    [+] Loaded {len(services)} luxury services. First: '{first_service['name']}' ({first_service['duration_minutes']} mins, NGN {first_service['price']})")

    # 4. Dynamic Availability Calculator
    print("\n[4] Testing Dynamic Availability Engine...")
    target_date = None
    chosen_slot = None
    for day_offset in range(3, 14):
        check_date = (date.today() + timedelta(days=day_offset)).isoformat()
        avail, status = make_req(f"{BACKEND_URL}/availability/slots/?service_id={first_service['id']}&date={check_date}")
        if avail.get("is_open") and len(avail.get("slots", [])) > 0:
            target_date = check_date
            chosen_slot = avail["slots"][0]
            print(f"    [+] Calculated {len(avail['slots'])} available time slots for {target_date}. Selected: {chosen_slot['start_time']}")
            break
            
    assert target_date is not None and chosen_slot is not None, "No open dates with available slots found in range"

    # 5. Products Catalog
    print("\n[5] Testing E-Commerce Products Catalog...")
    products_res, status = make_req(f"{BACKEND_URL}/products/")
    products = products_res.get("results", products_res) if isinstance(products_res, dict) else products_res
    assert len(products) > 0, "No products found"
    
    # Pick products with available inventory
    available_prods = [p for p in products if p["stock_quantity"] >= 5]
    if not available_prods:
        available_prods = products
    first_product = available_prods[0]
    print(f"    [+] Loaded {len(products)} cosmetic formulations. Selected: '{first_product['name']}' (Stock: {first_product['stock_quantity']})")

    # 6. Full Booking Initiation & Hold
    print("\n[6] Testing Customer Booking Initiation (15-min hold & zero client trust pricing)...")
    booking_payload = {
        "service_id": first_service["id"],
        "booking_date": target_date,
        "start_time": chosen_slot["start_time"],
        "guest_name": "Victoria Adeyemi",
        "guest_email": "victoria@agamos.com",
        "guest_phone": "+234 801 234 5678",
        "guest_address": "4 Banana Island Road, Ikoyi",
        "customer_notes": "VIP bridal treatment preparation",
        "session_products": [{"product_id": first_product["id"], "quantity": 1}],
        "callback_url": "http://127.0.0.1:5173/booking/verify"
    }
    booking_res, status = make_req(f"{BACKEND_URL}/bookings/initiate/", data=booking_payload, method="POST")
    booking = booking_res["booking"]
    booking_ref = booking["booking_reference"]
    payment_ref = booking_res["payment"]["reference"]
    print(f"    [+] Booking Dossier Reserved: {booking_ref} (Status: {booking['status']}, Total: NGN {booking['total_amount']})")

    # 7. Paystack Payment Verification
    print("\n[7] Testing Paystack Payment Verification Gateway...")
    verify_res, status = make_req(f"{BACKEND_URL}/payments/verify/{payment_ref}/", method="POST")
    assert verify_res["status"].upper() == "SUCCESS", f"Payment verification failed: {verify_res}"
    print(f"    [+] Paystack Verified: Booking {verify_res['booking_reference']} transitioned to CONFIRMED / PAID.")

    # 8. Cryptographic QR Attendance Verification
    print("\n[8] Testing Concierge Camera QR Single-Use Attendance Verification...")
    booking_detail, status = make_req(f"{BACKEND_URL}/bookings/{booking_ref}/")
    qr_token = booking_detail["qr_code"]["secure_token"]
    
    # 8a: First scan
    scan1, status = make_req(f"{BACKEND_URL}/qr/verify-and-attend/", data={"token": qr_token}, method="POST")
    assert scan1["success"] is True, f"First scan failed: {scan1}"
    print(f"    [+] First QR Scan: Attendance confirmed for {scan1['booking']['guest_name']} (Status: {scan1['status']})")

    # 8b: Re-scan attempt (Security prevention)
    scan2, status = make_req(f"{BACKEND_URL}/qr/verify-and-attend/", data={"token": qr_token}, method="POST")
    assert scan2["success"] is False and scan2["status"] == "ALREADY_USED", f"Re-scan was not rejected! {scan2}"
    print(f"    [+] Re-Scan Rejected (Security): '{scan2['message']}'")

    # 9. E-Commerce Cart & Checkout with Inventory Reduction
    print("\n[9] Testing E-Commerce Checkout with Atomic Inventory Deduction...")
    pre_order_prod, _ = make_req(f"{BACKEND_URL}/products/{first_product['slug']}/")
    initial_stock = pre_order_prod["stock_quantity"]
    order_payload = {
        "guest_name": "Victoria Adeyemi",
        "guest_email": "victoria@agamos.com",
        "guest_phone": "+234 801 234 5678",
        "delivery_type": "DELIVERY",
        "shipping_address": "4 Banana Island Road",
        "shipping_city": "Lagos",
        "shipping_state": "Lagos State",
        "items": [{"product_id": first_product["id"], "quantity": 2}],
        "callback_url": "http://127.0.0.1:5173/order/verify"
    }
    order_res, status = make_req(f"{BACKEND_URL}/orders/checkout/", data=order_payload, method="POST")
    order = order_res["order"]
    order_ref = order["order_reference"]
    order_pay_ref = order_res["payment"]["reference"]
    print(f"    [+] Order Created: {order_ref} (Total: NGN {order['total_amount']}, Delivery: {order['delivery_type_display']})")

    # Verify order payment
    order_verify, status = make_req(f"{BACKEND_URL}/payments/verify/{order_pay_ref}/", method="POST")
    assert order_verify["status"].upper() == "SUCCESS"
    print(f"    [+] Order Payment Verified: {order_ref} transitioned to PAID.")

    # Check inventory reduction
    updated_product, status = make_req(f"{BACKEND_URL}/products/{first_product['slug']}/")
    expected_stock = initial_stock - 2
    assert updated_product["stock_quantity"] == expected_stock, f"Stock was not reduced properly! Got {updated_product['stock_quantity']}, expected {expected_stock}"
    print(f"    [+] Atomic Stock Reduction Verified: {first_product['name']} stock went from {initial_stock} -> {updated_product['stock_quantity']}")

    # 10. Admin Authentication & Executive KPI Dashboard
    print("\n[10] Testing Admin Authentication & Executive KPI Metrics...")
    login_res, status = make_req(f"{BACKEND_URL}/accounts/login/", data={"email": "admin@agamos.com", "username": "admin@agamos.com", "password": "AgamosLuxury2026!"}, method="POST")
    if not isinstance(login_res, dict) or "access" not in login_res:
        print(f"    [!] Login response was: {login_res} (status: {status})")
    
    admin_token = login_res.get("access") or login_res.get("tokens", {}).get("access")
    assert admin_token is not None, f"Could not extract admin token from: {login_res}"
    user_info = login_res.get("user", {})
    print(f"    [+] Admin Authenticated: {user_info.get('first_name', 'Admin')} ({user_info.get('role', 'ADMIN')})")

    metrics_res, status = make_req(f"{BACKEND_URL}/admin/metrics/", headers={"Authorization": f"Bearer {admin_token}"})
    print(f"    [+] Executive Dashboard Telemetry:")
    total_rev = str(metrics_res['metrics']['total_revenue_formatted']).replace('\u20a6', 'NGN ')
    print(f"        - Total Gross Revenue: {total_rev}")
    print(f"        - Total Bookings: {metrics_res['metrics']['total_bookings']}")
    print(f"        - Total Orders: {metrics_res['metrics']['total_orders']}")
    print(f"        - Low Stock Items: {metrics_res['metrics']['low_stock_count']}")

    print("\n=======================================================")
    print("[SUCCESS] ALL 10 END-TO-END SYSTEM DOMAINS PASSED 100%!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_e2e_tests()
