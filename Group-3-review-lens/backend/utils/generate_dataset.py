import csv, random
from datetime import datetime, timedelta
from collections import Counter

random.seed(42)

PRODUCTS = [
    ("Samsung Galaxy S23 Ultra",      "Smartphone"),
    ("Apple iPhone 15 Pro",           "Smartphone"),
    ("OnePlus Nord CE 3",             "Smartphone"),
    ("Google Pixel 8 Pro",            "Smartphone"),
    ("Xiaomi 13 Pro",                 "Smartphone"),
    ("Realme 11 Pro Plus",            "Smartphone"),
    ("Vivo V29 Pro",                  "Smartphone"),
    ("Oppo Reno 10 Pro",              "Smartphone"),
    ("Nothing Phone 2",               "Smartphone"),
    ("Motorola Edge 40 Pro",          "Smartphone"),
    ("iQOO 11 Pro",                   "Smartphone"),
    ("Poco X5 Pro",                   "Smartphone"),
    ("Dell XPS 15 Laptop",            "Laptop"),
    ("Apple MacBook Air M2",          "Laptop"),
    ("Acer Aspire 7 Gaming Laptop",   "Laptop"),
    ("HP Pavilion Laptop 15",         "Laptop"),
    ("Lenovo IdeaPad Slim 5",         "Laptop"),
    ("ASUS ROG Strix G15",            "Laptop"),
    ("MSI Modern 15",                 "Laptop"),
    ("HP Envy x360",                  "Laptop"),
    ("Sony WH-1000XM5 Headphones",    "Audio"),
    ("Bose QuietComfort 45",          "Audio"),
    ("boAt Airdopes 141",             "Audio"),
    ("JBL Tune 770NC",                "Audio"),
    ("Sennheiser Momentum 4",         "Audio"),
    ("Apple AirPods Pro 2",           "Audio"),
    ("Samsung Galaxy Buds2 Pro",      "Audio"),
    ("Jabra Evolve2 55",              "Audio"),
    ("LG 55 inch 4K Smart TV",        "Television"),
    ("Samsung 65 inch QLED TV",       "Television"),
    ("Sony Bravia 50 inch 4K TV",     "Television"),
    ("Mi 43 inch Smart TV 4X",        "Television"),
    ("OnePlus 55 inch Y1S Pro TV",    "Television"),
    ("TCL 55 inch QLED TV",           "Television"),
    ("Philips Air Fryer HD9252",      "Kitchen Appliance"),
    ("Instant Pot Duo 7-in-1",        "Kitchen Appliance"),
    ("Bajaj Mixer Grinder 750W",      "Kitchen Appliance"),
    ("Prestige Induction Cooktop",    "Kitchen Appliance"),
    ("Morphy Richards OTG 24L",       "Kitchen Appliance"),
    ("Havells Iron 2000W",            "Kitchen Appliance"),
    ("Apple Watch Series 9",          "Wearable"),
    ("Fitbit Charge 6",               "Wearable"),
    ("Samsung Galaxy Watch 6",        "Wearable"),
    ("Noise ColorFit Pro 4",          "Wearable"),
    ("Amazfit GTR 4",                 "Wearable"),
    ("Garmin Forerunner 255",         "Wearable"),
    ("Canon EOS 1500D DSLR",          "Camera"),
    ("GoPro Hero 11 Black",           "Camera"),
    ("Sony Alpha ZV-E10 Mirrorless",  "Camera"),
    ("Nikon D3500 DSLR",              "Camera"),
    ("Dyson V12 Vacuum Cleaner",      "Home Appliance"),
    ("Voltas 1.5 Ton Split AC",       "Home Appliance"),
    ("LG Front Load Washing Machine", "Home Appliance"),
    ("Whirlpool 265L Refrigerator",   "Home Appliance"),
    ("Eureka Forbes RO Water Purifier","Home Appliance"),
    ("Crompton Ceiling Fan 48 inch",  "Home Appliance"),
    ("Apple iPad Air 5th Gen",        "Tablet"),
    ("Samsung Galaxy Tab S9",         "Tablet"),
    ("Lenovo Tab P12 Pro",            "Tablet"),
    ("Xiaomi Pad 6",                  "Tablet"),
]

CAT_FEATURES = {
    "Smartphone":        ["camera quality","battery life","display","performance","fast charging","build quality","software experience","5G connectivity","fingerprint sensor","thermal management"],
    "Laptop":            ["build quality","keyboard","display","battery backup","performance","thermal management","trackpad precision","SSD speed","RAM capacity","hinge durability"],
    "Audio":             ["sound quality","noise cancellation","battery life","wearing comfort","bass response","call quality","Bluetooth stability","ear cushion material","microphone clarity","codec support"],
    "Television":        ["picture quality","colour accuracy","smart TV interface","audio output","remote usability","HDR performance","refresh rate","viewing angles","local dimming","app selection"],
    "Kitchen Appliance": ["ease of use","cooking results","build quality","noise level","cleaning convenience","power output","timer accuracy","capacity","safety features","long-term durability"],
    "Wearable":          ["health tracking accuracy","battery life","display clarity","wearing comfort","GPS precision","heart rate monitoring","sleep tracking","companion app","strap quality","water resistance"],
    "Camera":            ["image quality","autofocus speed","low light performance","video quality","build quality","battery life","lens compatibility","shutter response","ISO performance","viewfinder clarity"],
    "Home Appliance":    ["suction performance","noise level","energy efficiency","build quality","ease of use","after-sales support","installation process","capacity","motor durability","filter quality"],
    "Tablet":            ["display quality","chip performance","battery life","build quality","stylus support","speaker output","camera quality","software experience","port availability","multitasking speed"],
}

# Evaluative phrases shared across categories - forces model to learn sentiment from context
POS_EVAL = [
    "is genuinely outstanding and exceeded every expectation I had",
    "has been flawless since day one — could not be happier",
    "is the best I have experienced in this price bracket by far",
    "impressed me greatly and justifies the price completely",
    "works brilliantly and has never let me down in daily use",
    "is a standout feature that sets this product apart from competitors",
    "is top notch and on par with products that cost twice as much",
    "delivered everything the reviews promised and then some",
    "is exceptional — showed it to a friend and they ordered one immediately",
    "performs beyond what I expected for the money I paid",
    "has genuinely improved my daily routine in ways I did not anticipate",
    "is reliable, consistent and worth every rupee without hesitation",
    "left me thoroughly impressed after three months of heavy daily use",
    "is best in class — I compared five alternatives before choosing this",
    "is a genuine highlight and the reason I recommend this to everyone",
    "holds up perfectly even under heavy use — no degradation at all",
    "is polished and refined in a way that reflects careful engineering",
    "works exactly as advertised with zero gimmicks — a refreshing change",
    "is the main reason I gave this product five stars without hesitation",
    "is surprisingly capable and punches well above the price point",
    "continues to impress me every single day of use without fail",
    "surpassed every competing product I tested in the same category",
    "is rock solid and has given me complete confidence in this purchase",
    "is genuinely class leading and makes competitors look inadequate",
    "delivered a premium experience that I did not expect at this price",
    "is consistently excellent and shows no signs of wear after months",
]

NEG_EVAL = [
    "is a major disappointment that does not match the product listing at all",
    "failed completely within two months — an unacceptable outcome at this price",
    "is the worst I have encountered in this category by a significant margin",
    "is unreliable and has made daily use genuinely frustrating",
    "stopped working after three weeks of normal use — total waste of money",
    "is embarrassingly poor for the price and falls short of every claim made",
    "is broken out of the box and the seller has been completely unresponsive",
    "let me down badly after two months — quality control is clearly non-existent",
    "is a dealbreaker that makes this product impossible to recommend to anyone",
    "degraded significantly within weeks — clearly not built to last at all",
    "is far worse than every competitor at this price and should be avoided",
    "caused me to return the product after just four days of attempting to use it",
    "is so poor that I genuinely question how it passed any quality testing",
    "has been completely unreliable from the start and shows no signs of improving",
    "failed during warranty and the after-sales process was an absolute nightmare",
    "is a disgrace at this price point — competitors offer far more for less",
    "performs at a level that is completely unacceptable given what was paid",
    "is the primary reason I will never purchase from this brand again",
    "caused problems immediately and customer service offered no useful solution",
    "is dangerously unreliable and I strongly advise others to avoid this product",
    "deteriorated rapidly and is now completely non-functional after minimal use",
    "failed to meet even the most basic expectations for a product in this segment",
    "is so inconsistent that basic daily tasks have become genuinely unreliable",
    "broke down under normal conditions — a reflection of extremely poor build quality",
    "is a fundamental flaw that no amount of software updates can fix",
    "represents terrible value and there are far better options available for less",
]

NEU_EVAL = [
    "is acceptable but falls short of what competitors offer at the same price",
    "works adequately for basic needs but will not satisfy demanding users",
    "is average for this segment — functional but nothing particularly impressive",
    "meets minimum expectations but leaves room for meaningful improvement",
    "is passable for casual use but power users will find it lacking",
    "is mediocre compared to alternatives I considered in the same price range",
    "has some strengths but is ultimately held back by clear compromises",
    "is functional and stable but does not stand out in any meaningful way",
    "does the job without any excitement — completely average for the category",
    "is hit or miss depending on the use case — reliable for some tasks only",
    "is okay for occasional use but starts to show limitations under regular stress",
    "is adequate if you have modest expectations and are not comparing alternatives",
    "is a mixed experience overall — some good days and some frustrating ones",
    "is unremarkable and fails to justify choosing this over competing products",
    "works as advertised but the advertised performance is itself unimpressive",
    "is fine as a budget option but do not expect anything beyond the basics",
    "is functional without being inspiring — the bare minimum for this price tier",
    "shows its limitations quickly once you move beyond simple everyday tasks",
    "is stable enough but the inconsistency in performance becomes noticeable",
    "is the kind of product you use without complaint but also without enthusiasm",
    "is serviceable but I expected noticeably better given the price I paid",
    "is a compromise product — acceptable if budget is the primary constraint",
    "gets the basics right but stumbles on anything requiring consistent reliability",
    "does what it promises on good days — on bad days it is genuinely frustrating",
    "is a safe but uninspiring choice that will not disappoint or delight",
    "is adequate for light use but becomes a weak point under any real pressure",
]

# Sentence frames - vary the sentence structure for more diversity
POS_FRAMES = [
    "The {feature} on the {product} {eval}.",
    "I have been using the {product} for months and the {feature} {eval}.",
    "After extensive testing, the {product}'s {feature} {eval}.",
    "The {product} impressed me most with its {feature} which {eval}.",
    "Bought the {product} last month — the {feature} {eval} and I have zero regrets.",
    "The {feature} on my {product} {eval} — worth every rupee paid.",
    "Three months in and the {product}'s {feature} {eval} — no signs of wear.",
    "Switched to the {product} for its {feature} and it {eval} completely.",
    "The {product} is a great buy. The {feature} {eval}.",
    "Totally paisa vasool — the {product}'s {feature} {eval}.",
]

NEG_FRAMES = [
    "The {feature} on the {product} {eval}.",
    "Do not buy the {product} — the {feature} {eval}.",
    "After two months with the {product} the {feature} {eval} and I regret this purchase.",
    "The {product}'s {feature} {eval} — returning it immediately.",
    "Paid a premium for the {product} but the {feature} {eval}.",
    "Warning to buyers — the {product}'s {feature} {eval}.",
    "The {product} looked good in photos but the {feature} {eval}.",
    "Deeply disappointed — the {product}'s {feature} {eval}.",
    "The {product} is not worth the price. The {feature} {eval}.",
    "Complete waste of money — the {product}'s {feature} {eval}.",
]

NEU_FRAMES = [
    "The {feature} on the {product} {eval}.",
    "The {product} is a decent product overall but the {feature} {eval}.",
    "After a month with the {product}, I find the {feature} {eval}.",
    "The {product}'s {feature} {eval} — three stars feels right.",
    "Mixed feelings about the {product} — the {feature} {eval}.",
    "The {product} gets the job done but the {feature} {eval}.",
    "If you have moderate expectations the {product} is fine — the {feature} {eval}.",
    "The {product} is okay for basic use. The {feature} {eval}.",
    "Neither impressed nor disappointed — the {product}'s {feature} {eval}.",
    "The {product} is a fair buy if you are not too demanding. The {feature} {eval}.",
]

def build_reviews(product, category):
    features = CAT_FEATURES[category]
    reviews = {"Positive": [], "Neutral": [], "Negative": []}
    
    for i, (frame, eval_phrase) in enumerate(
        [(f, e) for f in POS_FRAMES for e in POS_EVAL]
    ):
        f = features[i % len(features)]
        reviews["Positive"].append(frame.format(product=product, feature=f, eval=eval_phrase))
    
    for i, (frame, eval_phrase) in enumerate(
        [(f, e) for f in NEG_FRAMES for e in NEG_EVAL]
    ):
        f = features[i % len(features)]
        reviews["Negative"].append(frame.format(product=product, feature=f, eval=eval_phrase))
    
    for i, (frame, eval_phrase) in enumerate(
        [(f, e) for f in NEU_FRAMES for e in NEU_EVAL]
    ):
        f = features[i % len(features)]
        reviews["Neutral"].append(frame.format(product=product, feature=f, eval=eval_phrase))
    
    return reviews

# Build review bank
review_bank = {}
for product, category in PRODUCTS:
    bank = build_reviews(product, category)
    review_bank[(product, "Positive")] = bank["Positive"]
    review_bank[(product, "Neutral")]  = bank["Neutral"]
    review_bank[(product, "Negative")] = bank["Negative"]

all_texts = [t for texts in review_bank.values() for t in texts]
print(f"Total unique texts: {len(set(all_texts))} out of {len(all_texts)}")

# Platform config
PLATFORMS = ["Amazon","Flipkart","Meesho","Snapdeal","Croma","Reliance Digital","Tata CLiQ"]
PLATFORM_WEIGHTS = {
    "Amazon":           [5,  8, 12, 25, 50],
    "Flipkart":         [8, 10, 15, 22, 45],
    "Meesho":           [10, 12, 18, 25, 35],
    "Snapdeal":         [12, 14, 18, 22, 34],
    "Croma":            [5,  8, 13, 28, 46],
    "Reliance Digital": [6,  9, 15, 27, 43],
    "Tata CLiQ":        [4,  7, 12, 28, 49],
}
USERNAMES = ["TechEnthusiast","GadgetGuru","HappyBuyer","ValueHunter","VerifiedBuyer","FlipFanatic","MumbaiShopper","DelhiTech","IndianConsumer","RegularBuyer","GizmoFreak","DesiTechie","HyderabadShopper","BudgetShopper","SmartConsumer","CromaFan","RelianceFan","JioShopper","SnapdealUser","BangaloreBuyer","PuneReviewer","ChennaiCustomer","KolkataShopper","AhmedabadTech","SuratBuyer","NagpurShopper","JaipurTech","LucknowBuyer","IndoreUser","BhopalShopper"]

def weighted_rating(platform):
    w = PLATFORM_WEIGHTS[platform]
    r = random.random() * sum(w)
    for i, wi in enumerate(w):
        r -= wi
        if r <= 0: return i + 1
    return 5

def get_sentiment(rating):
    if rating >= 4: return "Positive"
    if rating == 3: return "Neutral"
    return "Negative"

def get_rating_for_sentiment(sentiment):
    if sentiment == "Positive": return random.choice([4,4,5,5])
    if sentiment == "Neutral":  return 3
    return random.choice([1,2])

def random_date():
    start = datetime(2022,1,1)
    delta = (datetime(2024,12,31) - start).days
    return (start + timedelta(days=random.randint(0,delta))).strftime("%Y-%m-%d")

rows = []
rid = 1

# Step 1: guarantee every unique review appears at least once
for (product, sentiment), pool in review_bank.items():
    category = dict(PRODUCTS)[product]
    for text in pool:
        platform = random.choice(PLATFORMS)
        rating   = get_rating_for_sentiment(sentiment)
        rows.append({
            "review_id": f"REV{rid:05d}", "product_name": product,
            "category": category, "platform": platform,
            "username": random.choice(USERNAMES)+str(random.randint(10,9999)),
            "rating": rating, "review_text": text, "sentiment": sentiment,
            "verified_purchase": random.choice(["Yes","No"]),
            "helpful_votes": random.randint(0,200), "review_date": random_date(),
        })
        rid += 1

print(f"After Step 1 (all unique once): {len(rows)} rows")

# Step 2: add realistic platform distribution rows to reach ~8000 total
for product, category in PRODUCTS:
    for platform in PLATFORMS:
        n = random.randint(5, 9)
        for _ in range(n):
            rating    = weighted_rating(platform)
            sentiment = get_sentiment(rating)
            pool = review_bank[(product, sentiment)]
            rows.append({
                "review_id": f"REV{rid:05d}", "product_name": product,
                "category": category, "platform": platform,
                "username": random.choice(USERNAMES)+str(random.randint(10,9999)),
                "rating": rating, "review_text": random.choice(pool), "sentiment": sentiment,
                "verified_purchase": random.choice(["Yes","No"]),
                "helpful_votes": random.randint(0,200), "review_date": random_date(),
            })
            rid += 1

random.shuffle(rows)
for i, r in enumerate(rows):
    r["review_id"] = f"REV{i+1:05d}"

out = "/mnt/user-data/outputs/reviews_dataset_v6.csv"
cols = ["review_id","product_name","category","platform","username","rating","review_text","sentiment","verified_purchase","helpful_votes","review_date"]
with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    w.writerows(rows)

unique = len(set(r["review_text"] for r in rows))
print(f"Total rows        : {len(rows):,}")
print(f"Unique reviews    : {unique:,}")
print(f"Sentiment split   : {dict(Counter(r['sentiment'] for r in rows))}")
print(f"Products          : {len(PRODUCTS)}")
print(f"Platforms         : {len(PLATFORMS)}")
print(f"Saved → {out}")