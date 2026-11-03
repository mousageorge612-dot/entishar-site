/*
  بيانات موقع انتشار — عدّل هذا الملف فقط لتحديث الأرقام والروابط والخدمات والأعمال.
  الأرقام بصيغة دولية دون + أو مسافات في حقل wa.
*/
window.ENTISHAR = {
  contacts: {
    main:    { label: "رقم شركة انتشار", note: "الاستفسارات وطلبات الخدمات والعروض", local: "0951 938 669", intl: "+963 951 938 669", wa: "963951938669" },
    office:  { label: "المكتب والتواصل مع جورج موسى", note: "المكتب وأعمال التصميم", local: "0987 461 750", intl: "+963 987 461 750", wa: "963987461750" },
    support: { label: "الدعم الفني لأنظمة المحاسبة", note: "للمشتركين في أنظمة المحاسبة", local: "0992 679 962", intl: "+963 992 679 962", wa: "963992679962" },
    store:   { label: "متجر انتشار للمبدعين", note: "الاشتراكات والخدمات الرقمية", local: "0968 747 231", intl: "+963 968 747 231", wa: "963968747231" }
  },

  address: "السقيلبية - طريق المشوار - دوار تمارى - الطابق الثالث - الجهة اليسرى",
  hours: ["09:00 صباحاً - 02:00 ظهراً", "04:00 مساءً - 07:30 مساءً"],

  links: {
    instagram: "https://www.instagram.com/entishar.agency/",
    store: "https://store.entishar.agency/",
    maps: "",      // أضف رابط Google Maps الحقيقي للمكتب هنا ليظهر زر الخريطة
    facebook: ""   // أضف رابط صفحة فيسبوك المؤكد هنا ليظهر في الموقع
  },

  /*
    معرض الأعمال (من ملف George-Mousa-Portfolio). الصور داخل assets/works.
    categories: identity | social | web | print | menu  (أول تصنيف يظهر على البطاقة)
    images: صور العمل التي تظهر عند فتحه، thumb: صورة البطاقة، url: رابط اختياري.
  */
  works: [
    {"title": "شاورمتي", "subtitle": "مطعم شاورما ووجبات سريعة · السقيلبية", "categories": ["identity", "print", "social"], "thumb": "assets/works/shawarmati-thumb.jpg", "images": ["assets/works/shawarmati-1.jpg", "assets/works/shawarmati-2.jpg", "assets/works/shawarmati-3.jpg"]},
    {"title": "شركة فؤاد برهوم", "subtitle": "تجارة البلاستيك ومواد التعبئة والتغليف · حماة", "categories": ["identity", "print", "social", "menu"], "thumb": "assets/works/fouad-barhoum-thumb.jpg", "images": ["assets/works/fouad-barhoum-1.jpg", "assets/works/fouad-barhoum-2.jpg", "assets/works/fouad-barhoum-3.jpg"]},
    {"title": "الحريف", "subtitle": "مطعم وجبات سريعة", "categories": ["identity", "print", "social", "menu"], "thumb": "assets/works/alharif-thumb.jpg", "images": ["assets/works/alharif-1.jpg", "assets/works/alharif-2.jpg", "assets/works/alharif-3.jpg"]},
    {"title": "Tony & Zina", "subtitle": "عيادة أسنان وتجميل وجه", "categories": ["identity", "social"], "thumb": "assets/works/tony-zina-thumb.jpg", "images": ["assets/works/tony-zina-1.jpg", "assets/works/tony-zina-2.jpg", "assets/works/tony-zina-3.jpg"]},
    {"title": "Dr. Diana Beauty Clinic", "subtitle": "عيادة تجميل غير جراحي · السقيلبية", "categories": ["identity", "web", "social", "print"], "thumb": "assets/works/diana-thumb.jpg", "images": ["assets/works/diana-1.jpg", "assets/works/diana-2.jpg"]},
    {"title": "Dr. Leen Al Nader", "subtitle": "طبيبة تجميل وجلدية", "categories": ["identity", "social", "print"], "thumb": "assets/works/leen-alnader-thumb.jpg", "images": ["assets/works/leen-alnader-1.jpg", "assets/works/leen-alnader-2.jpg", "assets/works/leen-alnader-3.jpg"]},
    {"title": "زيت غريب · Garolive", "subtitle": "علامة زيوت طبيعية للشعر واللحية", "categories": ["identity", "print", "social", "web"], "thumb": "assets/works/garolive-thumb.jpg", "images": ["assets/works/garolive-1.jpg", "assets/works/garolive-2.jpg", "assets/works/garolive-3.jpg"]},
    {"title": "مناحل القاسم", "subtitle": "عسل طبيعي ومنتجات النحل · حماة", "categories": ["identity", "print"], "thumb": "assets/works/alqasim-thumb.jpg", "images": ["assets/works/alqasim-1.jpg", "assets/works/alqasim-2.jpg", "assets/works/alqasim-3.jpg"]},
    {"title": "KAI", "subtitle": "منيو إلكتروني لمكان سياحي جبلي · وادي النصارى", "categories": ["menu", "social"], "thumb": "assets/works/kai-thumb.jpg", "images": ["assets/works/kai-1.jpg", "assets/works/kai-2.jpg", "assets/works/kai-3.jpg"]},
    {"title": "فريسكا", "subtitle": "كافيه حلويات ومشروبات", "categories": ["menu", "social", "print"], "thumb": "assets/works/freska-thumb.jpg", "images": ["assets/works/freska-1.jpg", "assets/works/freska-2.jpg", "assets/works/freska-3.jpg"]},
    {"title": "عقارات السقيلبية", "subtitle": "منصة عقارات محلية", "categories": ["web", "identity", "social"], "thumb": "assets/works/suqaylabiyah-thumb.jpg", "images": ["assets/works/suqaylabiyah-1.jpg", "assets/works/suqaylabiyah-2.jpg", "assets/works/suqaylabiyah-3.jpg"], "url": "https://suqaylabiyah.wadiaqar.com"},
    {"title": "عقارات مشتى الحلو", "subtitle": "منصة عقارات وإيجارات موسمية", "categories": ["web", "identity", "social"], "thumb": "assets/works/mashta-thumb.jpg", "images": ["assets/works/mashta-1.jpg", "assets/works/mashta-2.jpg", "assets/works/mashta-3.jpg"], "url": "https://mashta.wadiaqar.com"},
    {"title": "عقارات الوادي", "subtitle": "منصة عقارات وادي النصارى", "categories": ["web", "social"], "thumb": "assets/works/alwadi-thumb.jpg", "images": ["assets/works/alwadi-1.jpg", "assets/works/alwadi-2.jpg", "assets/works/alwadi-3.jpg"], "url": "https://alwadi.wadiaqar.com"},
    {"title": "George Mousa Coaching", "subtitle": "علامة شخصية لمدرب أونلاين", "categories": ["identity", "web", "social"], "thumb": "assets/works/gm-coaching-thumb.jpg", "images": ["assets/works/gm-coaching-1.jpg", "assets/works/gm-coaching-2.jpg", "assets/works/gm-coaching-3.jpg"], "url": "https://georgemousa.com"}
  ]
};
