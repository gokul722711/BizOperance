import os
import sys
import django

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from decimal import Decimal
import json

def test_full_scenario():
    c = Client()
    print("==================================================")
    print("BIZOPERANCE E2E VERIFICATION TEST")
    print("==================================================")

    # 1. Reset demo to baseline
    print("\n[Step 1] Ensuring fresh demonstration baseline...")
    r = c.post('/api/demo/reset/')
    assert r.status_code == 200, f"Reset failed: {r.content}"
    print("✓ Demo baseline initialized.")

    # 2. View the dashboard
    print("\n[Step 2] Fetching Dashboard overview (30d)...")
    r = c.get('/api/dashboard/?range=30d')
    assert r.status_code == 200, f"Dashboard failed: {r.content}"
    dash_data = r.json()
    kpis = dash_data['kpis']
    print(f"✓ Dashboard loaded. Total Revenue: ${kpis['total_revenue']}, Total Orders: {kpis['total_orders']}, Active Customers: {kpis['active_customers']}, Pending Orders: {kpis['pending_orders']}")
    assert kpis['total_orders'] > 0
    assert len(dash_data['recent_orders']) > 0

    # 3. Global search for a customer
    print("\n[Step 3] Global search for customer 'Acme'...")
    r = c.get('/api/search/?q=Acme')
    assert r.status_code == 200
    search_res = r.json()
    assert len(search_res['customers']) > 0, "Expected customer Acme in search"
    acme_cust = search_res['customers'][0]
    cust_id = acme_cust['id']
    print(f"✓ Found customer: {acme_cust['title']} (ID: {cust_id})")

    # 4. Open customer profile
    print(f"\n[Step 4] Opening customer profile for ID {cust_id}...")
    r = c.get(f'/api/customers/{cust_id}/')
    assert r.status_code == 200
    cust_profile = r.json()
    print(f"✓ Customer profile loaded: {cust_profile['name']}, Total Orders: {cust_profile['total_orders']}, Total Spent: ${cust_profile['total_spent']}")

    # 5 & 6. Create a new order with items
    print("\n[Step 5 & 6] Creating new order for Acme Global with products...")
    # Get available products
    r = c.get('/api/products/')
    prods = r.json()['results'] if 'results' in r.json() else r.json()
    p1 = prods[0]
    p2 = prods[1]
    initial_p1_stock = p1['stock_quantity']

    order_payload = {
        "customer_id": cust_id,
        "status": "pending",
        "payment_status": "pending",
        "notes": "E2E verification automated order",
        "items": [
            {
                "product_id": p1['id'],
                "product_name": p1['name'],
                "unit_price": p1['unit_price'],
                "quantity": 2
            },
            {
                "product_id": p2['id'],
                "product_name": p2['name'],
                "unit_price": p2['unit_price'],
                "quantity": 1
            }
        ]
    }
    r = c.post('/api/orders/', data=json.dumps(order_payload), content_type='application/json')
    assert r.status_code == 201, f"Create order failed: {r.content}"
    new_order = r.json()
    order_id = new_order['id']
    print(f"✓ Order created: {new_order['order_number']}, Subtotal: ${new_order['subtotal']}, Total: ${new_order['total_amount']}")

    # 7. Confirm order totals & calculations
    subtotal_expected = (Decimal(str(p1['unit_price'])) * 2) + (Decimal(str(p2['unit_price'])) * 1)
    tax_expected = round(subtotal_expected * (Decimal(str(new_order['tax_rate'])) / Decimal('100.00')), 2)
    total_expected = subtotal_expected + tax_expected
    assert Decimal(str(new_order['total_amount'])) == total_expected, f"Total mismatch: {new_order['total_amount']} vs {total_expected}"
    print(f"✓ Order totals verified mathematically: Subtotal ${subtotal_expected} + Tax ${tax_expected} = Total ${total_expected}")

    # Verify inventory was deducted
    r = c.get(f'/api/products/{p1["id"]}/')
    updated_p1 = r.json()
    assert updated_p1['stock_quantity'] == initial_p1_stock - 2, f"Stock not decremented properly: {updated_p1['stock_quantity']}"
    print(f"✓ Inventory successfully decremented from {initial_p1_stock} to {updated_p1['stock_quantity']} for {p1['name']}")

    # 8. Update order status
    print(f"\n[Step 8] Updating order {new_order['order_number']} status to 'completed' and payment to 'paid'...")
    r = c.post(f'/api/orders/{order_id}/update_status/', data=json.dumps({'status': 'completed'}), content_type='application/json')
    assert r.status_code == 200
    r = c.post(f'/api/orders/{order_id}/update_payment_status/', data=json.dumps({'payment_status': 'paid'}), content_type='application/json')
    assert r.status_code == 200
    print("✓ Order status updated to 'completed' and payment updated to 'paid'.")

    # 9. Adjust product stock
    print(f"\n[Step 9] Adjusting stock for product ID {p1['id']} (+10 units)...")
    r = c.post(f'/api/products/{p1["id"]}/adjust_stock/', data=json.dumps({'quantity_delta': 10, 'reason': 'Audit restock'}), content_type='application/json')
    assert r.status_code == 200
    adj_prod = r.json()
    print(f"✓ Stock adjusted. New stock quantity: {adj_prod['stock_quantity']}")

    # 10 & 11. Create a task and mark it completed
    print("\n[Step 10 & 11] Creating task and marking completed...")
    task_payload = {
        "title": "Client SLA Contract Review",
        "description": "Review Q4 contract milestones for Acme Global",
        "assigned_to": "Sarah Chen",
        "priority": "high",
        "status": "todo",
        "due_date": "2026-11-25"
    }
    r = c.post('/api/tasks/', data=json.dumps(task_payload), content_type='application/json')
    assert r.status_code == 201
    task = r.json()
    task_id = task['id']
    print(f"✓ Task created: {task['title']} (ID: {task_id})")

    r = c.post(f'/api/tasks/{task_id}/change_status/', data=json.dumps({'status': 'completed'}), content_type='application/json')
    assert r.status_code == 200
    assert r.json()['status'] == 'completed'
    print("✓ Task marked as completed.")

    # 12. Open analytics
    print("\n[Step 12] Fetching Analytics overview...")
    r = c.get('/api/analytics/overview/?range=30d')
    assert r.status_code == 200
    an_data = r.json()
    print(f"✓ Analytics overview loaded. Total revenue: ${an_data['metrics']['total_revenue']}, Orders: {an_data['metrics']['total_orders']}, AOV: ${an_data['metrics']['average_order_value']}")

    # 13. Export order data CSV
    print("\n[Step 13] Exporting Orders CSV...")
    r = c.get('/api/analytics/export/?type=orders')
    assert r.status_code == 200
    assert 'text/csv' in r['Content-Type']
    csv_lines = r.content.decode().splitlines()
    assert len(csv_lines) > 5
    print(f"✓ Orders CSV exported successfully with {len(csv_lines)} lines including headers.")

    # 14. Change business settings
    print("\n[Step 14] Changing business settings...")
    settings_payload = {
        "business_name": "Apex Global Operations",
        "currency_symbol": "€",
        "currency_code": "EUR"
    }
    r = c.put('/api/settings/', data=json.dumps(settings_payload), content_type='application/json')
    assert r.status_code == 200
    updated_settings = r.json()
    assert updated_settings['currency_symbol'] == '€'
    print(f"✓ Business settings updated to name: {updated_settings['business_name']}, currency: {updated_settings['currency_symbol']}")

    # 15 & 16. Verify data persists
    print("\n[Step 15 & 16] Verifying data persistence...")
    r = c.get('/api/settings/')
    assert r.json()['currency_symbol'] == '€'
    r = c.get(f'/api/orders/{order_id}/')
    assert r.json()['status'] == 'completed'
    print("✓ Persistence verified across requests.")

    # 17 & 18. Reset demo and verify return to initial baseline
    print("\n[Step 17 & 18] Triggering Demo Reset and verifying initial baseline...")
    r = c.post('/api/demo/reset/')
    assert r.status_code == 200
    r = c.get('/api/settings/')
    assert r.json()['currency_symbol'] == '$'
    assert r.json()['business_name'] == 'Apex Operations & Services'
    print("✓ Demo successfully reset! System returned to original baseline state.")

    print("\n==================================================")
    print("ALL 18 END-TO-END DEMO SCENARIO CHECKS PASSED 100%!")
    print("==================================================")

if __name__ == '__main__':
    test_full_scenario()
