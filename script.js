// بيانات النظام الغذائي المستخرجة من الصورة
const dietPlan = [
    {
        name: "الإفطار: الوجبة الأولى",
        items: ["3 إلى 4 بيضات", "نصف كوب من الشوفان", "موزة واحدة أو حفنة توت", "ملعقة صغيرة عسل نحل"]
    },
    {
        name: "الوجبة الثانية: وجبة خفيفة",
        items: ["علبة زبادي", "قبضة يد من المكسرات", "تفاحة"]
    },
    {
        name: "الوجبة الثالثة: الغداء",
        items: ["150 إلى 200 جرام صدور دجاج", "كوب إلى كوب ونصف من الأرز", "طبق سلطة"]
    },
    {
        name: "الوجبة الرابعة: العشاء",
        items: ["200 جرام جبنة قريش"]
    }
];

// إعدادات التقويم
let currentMonth = 0; // يناير
const currentYear = 2025;
let selectedDate = `2025-01-01`;

// جلب البيانات المحفوظة من المتصفح
let savedData = JSON.parse(localStorage.getItem("dietTracker2025")) || {};

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

// عناصر DOM
const daysGrid = document.getElementById("days-grid");
const monthYearDisplay = document.getElementById("month-year");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
const mealsContainer = document.getElementById("meals-container");
const selectedDateDisplay = document.getElementById("selected-date-display");
const successMessage = document.getElementById("success-message");

// تهيئة التطبيق
function init() {
    // تحديد تاريخ اليوم إذا كان في 2025
    const today = new Date();
    if(today.getFullYear() === 2025) {
        currentMonth = today.getMonth();
        let m = String(currentMonth + 1).padStart(2, '0');
        let d = String(today.getDate()).padStart(2, '0');
        selectedDate = `2025-${m}-${d}`;
    }
    
    renderCalendar();
    renderDietPlan();
    updateProgress();
}

// رسم التقويم
function renderCalendar() {
    daysGrid.innerHTML = "";
    monthYearDisplay.textContent = `${monthNames[currentMonth]} 2025`;

    // تفعيل/تعطيل الأزرار لتبقى داخل 2025
    prevBtn.disabled = currentMonth === 0;
    nextBtn.disabled = currentMonth === 11;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // فراغات الأيام السابقة
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        daysGrid.appendChild(emptyDiv);
    }

    // أيام الشهر
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.textContent = i;

        let m = String(currentMonth + 1).padStart(2, '0');
        let d = String(i).padStart(2, '0');
        let dateStr = `2025-${m}-${d}`;

        if (dateStr === selectedDate) {
            dayDiv.classList.add("selected");
        }

        // تلوين اليوم حسب الإنجاز
        if (savedData[dateStr]) {
            const totalItems = dietPlan.reduce((acc, meal) => acc + meal.items.length, 0);
            let checkedItems = 0;
            for (let key in savedData[dateStr]) {
                if (savedData[dateStr][key].checked) checkedItems++;
            }

            if (checkedItems === totalItems) {
                dayDiv.classList.add("completed"); // أخضر
            } else if (checkedItems > 0) {
                dayDiv.classList.add("partial"); // برتقالي
            }
        }

        dayDiv.addEventListener("click", () => {
            selectedDate = dateStr;
            renderCalendar();
            renderDietPlan();
        });

        daysGrid.appendChild(dayDiv);
    }
}

// رسم خطة النظام الغذائي لليوم المحدد
function renderDietPlan() {
    mealsContainer.innerHTML = "";
    selectedDateDisplay.textContent = `قائمة يوم: ${selectedDate}`;
    
    if (!savedData[selectedDate]) {
        savedData[selectedDate] = {};
    }

    dietPlan.forEach((meal, mealIndex) => {
        const mealCard = document.createElement("div");
        mealCard.classList.add("meal-card");
        
        const mealTitle = document.createElement("h3");
        mealTitle.textContent = meal.name;
        mealCard.appendChild(mealTitle);

        meal.items.forEach((item, itemIndex) => {
            const itemKey = `${mealIndex}-${itemIndex}`;
            const itemData = savedData[selectedDate][itemKey] || { checked: false, substitute: "" };

            const foodItemDiv = document.createElement("div");
            foodItemDiv.classList.add("food-item");
            if(itemData.checked) foodItemDiv.classList.add("checked");

            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `check-${itemKey}`;
            checkbox.checked = itemData.checked;

            // Label
            const label = document.createElement("label");
            label.htmlFor = `check-${itemKey}`;
            label.textContent = item;

            // Substitute Button
            const subBtn = document.createElement("button");
            subBtn.classList.add("substitute-btn");
            subBtn.textContent = "إضافة بديل";

            // Substitute Input
            const subInput = document.createElement("input");
            subInput.type = "text";
            subInput.classList.add("substitute-input");
            subInput.placeholder = "اكتب البديل هنا...";
            subInput.value = itemData.substitute;
            
            if(itemData.substitute !== "") {
                subInput.classList.add("active");
                label.textContent = `(بديل) ${itemData.substitute}`;
            }

            // Events
            checkbox.addEventListener("change", (e) => {
                itemData.checked = e.target.checked;
                savedData[selectedDate][itemKey] = itemData;
                saveData();
                if(e.target.checked) foodItemDiv.classList.add("checked");
                else foodItemDiv.classList.remove("checked");
                updateProgress();
            });

            subBtn.addEventListener("click", () => {
                subInput.classList.toggle("active");
                if(!subInput.classList.contains("active")) {
                    itemData.substitute = "";
                    subInput.value = "";
                    label.textContent = item;
                    savedData[selectedDate][itemKey] = itemData;
                    saveData();
                }
            });

            subInput.addEventListener("input", (e) => {
                itemData.substitute = e.target.value;
                if(e.target.value.trim() !== "") {
                    label.textContent = `(بديل) ${e.target.value}`;
                } else {
                    label.textContent = item;
                }
                savedData[selectedDate][itemKey] = itemData;
                saveData();
            });

            foodItemDiv.appendChild(checkbox);
            foodItemDiv.appendChild(label);
            foodItemDiv.appendChild(subBtn);
            foodItemDiv.appendChild(subInput);
            mealCard.appendChild(foodItemDiv);
        });

        mealsContainer.appendChild(mealCard);
    });
    
    updateProgress();
}

// حفظ البيانات في المتصفح
function saveData() {
    localStorage.setItem("dietTracker2025", JSON.stringify(savedData));
    renderCalendar(); // لتحديث ألوان التقويم
}

// التحقق من نسبة الإنجاز وعرض الرسالة التشجيعية
function updateProgress() {
    const totalItems = dietPlan.reduce((acc, meal) => acc + meal.items.length, 0);
    let checkedItems = 0;
    
    for (let key in savedData[selectedDate]) {
        if (savedData[selectedDate][key].checked) checkedItems++;
    }

    if (checkedItems === totalItems && totalItems > 0) {
        successMessage.classList.remove("hidden");
        // إطلاق مؤثرات بصرية (Confetti)
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2ecc71', '#f1c40f', '#e74c3c']
        });
    } else {
        successMessage.classList.add("hidden");
    }
}

// أزرار التنقل بين الأشهر
prevBtn.addEventListener("click", () => {
    if (currentMonth > 0) {
        currentMonth--;
        renderCalendar();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentMonth < 11) {
        currentMonth++;
        renderCalendar();
    }
});

// بدء التشغيل
init();
