from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal
import random

from customers.models import Customer
from products.models import Product
from orders.models import Order, OrderItem
from tasks.models import Task
from business_settings.models import BusinessSettings
from core.models import ActivityLog, Notification

def seed_demonstration_data(clear_existing=False):
    if clear_existing:
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Customer.objects.all().delete()
        Product.objects.all().delete()
        Task.objects.all().delete()
        ActivityLog.objects.all().delete()
        Notification.objects.all().delete()

    # 1. Initialize Business Settings
    settings = BusinessSettings.get_settings()
    settings.business_name = "Apex Operations & Services"
    settings.business_email = "operations@apexsolutions.demo"
    settings.phone = "+1 (555) 345-6789"
    settings.address = "450 Enterprise Way, Suite 300, Metropolis"
    settings.currency_symbol = "$"
    settings.currency_code = "USD"
    settings.tax_rate = Decimal("8.50")
    settings.low_stock_threshold_default = 10
    settings.notifications_enabled = True
    settings.save()

    # 2. Seed Products & Services (10 items across diverse categories)
    products_data = [
        {"name": "Enterprise Cloud Setup", "sku": "SRV-CLD-01", "category": "Cloud Services", "unit_price": Decimal("1200.00"), "stock_quantity": 45, "low_stock_threshold": 10},
        {"name": "Monthly Managed IT Support", "sku": "SUB-IT-02", "category": "Subscriptions", "unit_price": Decimal("450.00"), "stock_quantity": 80, "low_stock_threshold": 15},
        {"name": "Security Audit & Compliance", "sku": "CON-SEC-03", "category": "Consulting", "unit_price": Decimal("1850.00"), "stock_quantity": 20, "low_stock_threshold": 5},
        {"name": "Ergonomic Office Chair Pro", "sku": "HW-CHR-04", "category": "Hardware & Office", "unit_price": Decimal("320.00"), "stock_quantity": 8, "low_stock_threshold": 10},  # Low stock
        {"name": "4K Ultra-HD Conference Webcam", "sku": "HW-CAM-05", "category": "Hardware & Office", "unit_price": Decimal("180.00"), "stock_quantity": 3, "low_stock_threshold": 8},  # Low stock
        {"name": "Workflow Automation Blueprint", "sku": "SRV-AUT-06", "category": "Consulting", "unit_price": Decimal("950.00"), "stock_quantity": 30, "low_stock_threshold": 5},
        {"name": "High-Speed Gigabit Router X", "sku": "NET-RTR-07", "category": "Networking", "unit_price": Decimal("240.00"), "stock_quantity": 0, "low_stock_threshold": 6},  # Out of stock
        {"name": "Annual Software License Pack", "sku": "LIC-SFT-08", "category": "Subscriptions", "unit_price": Decimal("600.00"), "stock_quantity": 50, "low_stock_threshold": 12},
        {"name": "Custom Data Integration Pipeline", "sku": "SRV-DAT-09", "category": "Cloud Services", "unit_price": Decimal("2100.00"), "stock_quantity": 15, "low_stock_threshold": 5},
        {"name": "Industrial Thermal Label Printer", "sku": "PRN-LBL-10", "category": "Hardware & Office", "unit_price": Decimal("290.00"), "stock_quantity": 14, "low_stock_threshold": 5},
        {"name": "Staff Onboarding & Training Workshop", "sku": "TRN-STF-11", "category": "Consulting", "unit_price": Decimal("750.00"), "stock_quantity": 25, "low_stock_threshold": 5},
        {"name": "Eco-Packaging Shipping Supplies Box", "sku": "SUP-SHP-12", "category": "Supplies", "unit_price": Decimal("85.00"), "stock_quantity": 6, "low_stock_threshold": 15},  # Low stock
    ]

    created_products = []
    for p in products_data:
        prod, _ = Product.objects.get_or_create(sku=p["sku"], defaults=p)
        created_products.append(prod)

    # 3. Seed Customers (12 customers)
    customers_data = [
        {"name": "Acme Global Industries", "email": "procurement@acmeglobal.demo", "phone": "+1 (555) 101-2020", "customer_type": "business", "address": "1200 Industrial Parkway, North Haven", "notes": "Enterprise VIP client. Net-30 payment terms."},
        {"name": "Elena Rostova", "email": "elena.rostova@techstudio.demo", "phone": "+1 (555) 234-5671", "customer_type": "individual", "address": "45 Park Avenue, Apt 8B, Metropolis", "notes": "Prefers electronic invoicing."},
        {"name": "Beacon Media & Agency", "email": "accounts@beaconmedia.demo", "phone": "+1 (555) 345-6782", "customer_type": "business", "address": "88 Creative Blvd, Suite 210, Austin", "notes": "Quarterly subscription renewal on IT services."},
        {"name": "David K. Vance", "email": "dvance@meridianlogistics.demo", "phone": "+1 (555) 456-7893", "customer_type": "individual", "address": "320 Harbor View Dr, Seattle", "notes": "Independent logistics consultant."},
        {"name": "Nexus Health Partners", "email": "supply@nexushealth.demo", "phone": "+1 (555) 567-8904", "customer_type": "business", "address": "500 Medical Center Way, Boston", "notes": "Annual compliance and audit contractor."},
        {"name": "Sophia Lin", "email": "sophia.lin@designworks.demo", "phone": "+1 (555) 678-9015", "customer_type": "individual", "address": "14 Market Square, Portland", "notes": "Hardware upgrades for digital art studio."},
        {"name": "Pinnacle Retail Group", "email": "ops@pinnacleretail.demo", "phone": "+1 (555) 789-0126", "customer_type": "business", "address": "770 Commercial Row, Chicago", "notes": "Multi-location retail supply chain client."},
        {"name": "Robert Morales", "email": "robert.morales@freelance.demo", "phone": "+1 (555) 890-1237", "customer_type": "individual", "address": "890 Elm Street, Denver", "notes": "Regular purchaser of managed IT licenses."},
        {"name": "Summit Educational Institute", "email": "admin@summitedu.demo", "phone": "+1 (555) 901-2348", "customer_type": "business", "address": "300 Campus Drive, Ann Arbor", "notes": "Annual workshop and hardware buyer."},
        {"name": "Amina Al-Mansoor", "email": "amina.mansoor@venturecap.demo", "phone": "+1 (555) 012-3459", "customer_type": "individual", "address": "12 Skyline Blvd, San Francisco", "notes": "Executive workstation hardware request."},
        {"name": "Crestline Manufacturing", "email": "purchasing@crestlinemfg.demo", "phone": "+1 (555) 123-4560", "customer_type": "business", "address": "900 Foundry Road, Cleveland", "notes": "Automated data pipeline integration."},
        {"name": "Jordan Lee", "email": "jordan.lee@cooperative.demo", "phone": "+1 (555) 234-5679", "customer_type": "individual", "address": "67 Birch Lane, Minneapolis", "notes": "Small boutique shop owner."},
    ]

    created_customers = []
    for c in customers_data:
        cust, _ = Customer.objects.get_or_create(email=c["email"], defaults=c)
        created_customers.append(cust)

    # 4. Seed Orders (24 realistic orders distributed over past 60 days)
    now = timezone.now()
    orders_specs = [
        # Recent days
        {"days_ago": 0, "cust_idx": 0, "status": "processing", "payment": "paid", "items": [(0, 1), (1, 1)]},
        {"days_ago": 1, "cust_idx": 1, "status": "completed", "payment": "paid", "items": [(3, 2), (4, 1)]},
        {"days_ago": 2, "cust_idx": 2, "status": "completed", "payment": "paid", "items": [(1, 2), (5, 1)]},
        {"days_ago": 3, "cust_idx": 3, "status": "pending", "payment": "pending", "items": [(7, 1), (11, 2)]},
        {"days_ago": 4, "cust_idx": 4, "status": "completed", "payment": "paid", "items": [(2, 1), (8, 1)]},
        {"days_ago": 5, "cust_idx": 5, "status": "completed", "payment": "paid", "items": [(3, 1), (9, 1)]},
        {"days_ago": 6, "cust_idx": 6, "status": "processing", "payment": "partially_paid", "items": [(0, 1), (7, 2)]},
        {"days_ago": 7, "cust_idx": 7, "status": "completed", "payment": "paid", "items": [(1, 1), (11, 3)]},
        {"days_ago": 9, "cust_idx": 8, "status": "completed", "payment": "paid", "items": [(10, 2), (4, 1)]},
        {"days_ago": 11, "cust_idx": 9, "status": "cancelled", "payment": "pending", "items": [(6, 1)]},
        {"days_ago": 13, "cust_idx": 10, "status": "completed", "payment": "paid", "items": [(8, 1), (2, 1)]},
        {"days_ago": 15, "cust_idx": 11, "status": "completed", "payment": "paid", "items": [(1, 1), (3, 1)]},
        {"days_ago": 18, "cust_idx": 0, "status": "completed", "payment": "paid", "items": [(5, 1), (0, 1)]},
        {"days_ago": 21, "cust_idx": 2, "status": "completed", "payment": "paid", "items": [(7, 2)]},
        {"days_ago": 24, "cust_idx": 4, "status": "completed", "payment": "paid", "items": [(2, 1), (10, 1)]},
        {"days_ago": 28, "cust_idx": 6, "status": "completed", "payment": "paid", "items": [(9, 2), (11, 4)]},
        {"days_ago": 32, "cust_idx": 1, "status": "completed", "payment": "paid", "items": [(1, 1), (4, 1)]},
        {"days_ago": 36, "cust_idx": 8, "status": "completed", "payment": "paid", "items": [(10, 1), (5, 1)]},
        {"days_ago": 41, "cust_idx": 10, "status": "completed", "payment": "paid", "items": [(8, 1)]},
        {"days_ago": 45, "cust_idx": 0, "status": "completed", "payment": "paid", "items": [(0, 1), (2, 1)]},
        {"days_ago": 49, "cust_idx": 3, "status": "completed", "payment": "paid", "items": [(7, 1), (9, 1)]},
        {"days_ago": 53, "cust_idx": 5, "status": "completed", "payment": "paid", "items": [(3, 1)]},
        {"days_ago": 57, "cust_idx": 7, "status": "completed", "payment": "paid", "items": [(1, 1)]},
        {"days_ago": 60, "cust_idx": 9, "status": "completed", "payment": "paid", "items": [(4, 2)]},
    ]

    tax_rate = Decimal("8.50")
    order_counter = 1001

    for spec in orders_specs:
        customer = created_customers[spec["cust_idx"]]
        order_num = f"ORD-{order_counter}"
        order_counter += 1

        order_dt = now - timedelta(days=spec["days_ago"], hours=random.randint(1, 18))

        subtotal = Decimal("0.00")
        items_to_create = []

        for p_idx, qty in spec["items"]:
            prod = created_products[p_idx]
            line_total = prod.unit_price * qty
            subtotal += line_total
            items_to_create.append({
                "product": prod,
                "product_name": prod.name,
                "unit_price": prod.unit_price,
                "quantity": qty,
                "total_price": line_total
            })

        tax_amount = round(subtotal * (tax_rate / Decimal("100.00")), 2)
        total_amount = subtotal + tax_amount

        order = Order.objects.create(
            order_number=order_num,
            customer=customer,
            order_date=order_dt,
            status=spec["status"],
            payment_status=spec["payment"],
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            total_amount=total_amount,
            notes=f"Demonstration order for {customer.name}."
        )

        for it in items_to_create:
            OrderItem.objects.create(
                order=order,
                product=it["product"],
                product_name=it["product_name"],
                unit_price=it["unit_price"],
                quantity=it["quantity"],
                total_price=it["total_price"]
            )

    # 5. Seed Tasks (12 operational tasks)
    today = date.today()
    tasks_data = [
        {"title": "Review Q4 Infrastructure Migration Plan", "description": "Verify high-availability architecture and cluster configuration with the systems team.", "assigned_to": "Alex Morgan", "priority": "high", "status": "in_progress", "due_date": today + timedelta(days=2)},
        {"title": "Restock Low Inventory Items", "description": "Place reorder request for Ergonomic Office Chairs and 4K Conference Webcams with supplier.", "assigned_to": "Sarah Chen", "priority": "high", "status": "todo", "due_date": today + timedelta(days=1)},
        {"title": "Follow up with Acme Global on Contract Renewal", "description": "Schedule quarterly executive review to discuss cloud managed services scope.", "assigned_to": "Marcus Bell", "priority": "medium", "status": "todo", "due_date": today + timedelta(days=5)},
        {"title": "Perform Monthly Database Index Optimization", "description": "Analyze slow queries and rebuild B-tree indexes across production tables.", "assigned_to": "Alex Morgan", "priority": "medium", "status": "completed", "due_date": today - timedelta(days=2)},
        {"title": "Update Client Onboarding Documentation", "description": "Incorporate new digital security guidelines and client portal access instructions.", "assigned_to": "Sarah Chen", "priority": "low", "status": "in_progress", "due_date": today + timedelta(days=7)},
        {"title": "Audit Pending Vendor Invoices", "description": "Cross-check delivery receipts with billing statements before approving payments.", "assigned_to": "Marcus Bell", "priority": "medium", "status": "todo", "due_date": today - timedelta(days=1)},  # Overdue
        {"title": "Dispatch Order ORD-1002 Shipment", "description": "Verify courier tracking number and notify Elena Rostova.", "assigned_to": "Sarah Chen", "priority": "high", "status": "completed", "due_date": today - timedelta(days=1)},
        {"title": "Schedule Hardware Diagnostic for Demo Workstations", "description": "Ensure presentation laptops and peripherals are configured and updated.", "assigned_to": "Alex Morgan", "priority": "low", "status": "todo", "due_date": today + timedelta(days=10)},
        {"title": "Quarterly Operations Review Meeting", "description": "Prepare summary presentation on delivery turnaround and customer satisfaction metrics.", "assigned_to": "Marcus Bell", "priority": "high", "status": "todo", "due_date": today + timedelta(days=4)},
        {"title": "Reconcile End-of-Month Merchant Transactions", "description": "Ensure Stripe and bank deposits balance with closed sales orders.", "assigned_to": "Sarah Chen", "priority": "medium", "status": "todo", "due_date": today - timedelta(days=3)},  # Overdue
        {"title": "Configure Automated Nightly Database Backups", "description": "Set up encrypted S3 snapshots and test recovery procedure.", "assigned_to": "Alex Morgan", "priority": "high", "status": "completed", "due_date": today - timedelta(days=5)},
        {"title": "Review Supplier SLA for Packaging Materials", "description": "Check if lead times can be improved for shipping supplies boxes.", "assigned_to": "Sarah Chen", "priority": "low", "status": "todo", "due_date": today + timedelta(days=14)},
    ]

    for t in tasks_data:
        Task.objects.create(**t)

    # 6. Seed Activity Log
    activities = [
        {"action_type": "order_created", "entity_type": "order", "entity_id": "1", "title": "New Order Created: ORD-1001", "description": "Order ORD-1001 placed by Acme Global Industries for $1,790.25."},
        {"action_type": "order_status_updated", "entity_type": "order", "entity_id": "2", "title": "Order Completed: ORD-1002", "description": "Elena Rostova's order was marked completed and delivered."},
        {"action_type": "stock_adjusted", "entity_type": "product", "entity_id": "4", "title": "Low Stock Alert: Ergonomic Office Chair Pro", "description": "Stock reduced to 8 units. Below threshold warning triggered."},
        {"action_type": "customer_added", "entity_type": "customer", "entity_id": "11", "title": "Customer Registered: Crestline Manufacturing", "description": "Enterprise customer added to corporate CRM."},
        {"action_type": "task_completed", "entity_type": "task", "entity_id": "4", "title": "Task Completed: Database Index Optimization", "description": "Completed by Alex Morgan on schedule."},
        {"action_type": "settings_updated", "entity_type": "settings", "entity_id": "1", "title": "System Settings Configured", "description": "Updated baseline operational preferences and currency defaults."},
    ]

    for act in activities:
        ActivityLog.objects.create(**act)

    # 7. Seed Notifications
    notifications_data = [
        {"title": "Low Stock Warning", "message": "High-Speed Gigabit Router X is completely out of stock (0 units remaining).", "notification_type": "danger", "entity_type": "product", "entity_id": "7", "is_read": False},
        {"title": "Low Stock Warning", "message": "Ergonomic Office Chair Pro is below safety threshold (8 units remaining).", "notification_type": "warning", "entity_type": "product", "entity_id": "4", "is_read": False},
        {"title": "New High-Value Order", "message": "Order ORD-1005 created for $4,286.25 from Nexus Health Partners.", "notification_type": "success", "entity_type": "order", "entity_id": "5", "is_read": False},
        {"title": "Task Overdue Reminder", "message": "Audit Pending Vendor Invoices is overdue. Please review.", "notification_type": "warning", "entity_type": "task", "entity_id": "6", "is_read": False},
        {"title": "Demo Data Initialized", "message": "Demonstration business records are populated and ready for showcase.", "notification_type": "info", "entity_type": "system", "entity_id": "1", "is_read": True},
    ]

    for n in notifications_data:
        Notification.objects.create(**n)

    print("Demonstration seed data successfully populated.")
