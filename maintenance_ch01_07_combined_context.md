<!-- FILE: README.md -->

# Maintenance Requirements Pack — Chapters 1–5

هذه حزمة جاهزة للرفع إلى GitHub ثم فتحها داخل Cursor لاستخدامها كسياق لتنفيذ ميزات نظام صيانة مشابه وظيفيًا لما ورد في الفصول 1 إلى 5 من مرجع الصيانة.

> هذه الملفات ليست نسخًا حرفية من الدليل الأصلي. هي تحويل تحليلي/برمجي إلى متطلبات، كيانات، قواعد تحقق، واجهات API، وقاعدة بيانات مبدئية. الهدف هو مساعدة Cursor على إضافة الميزات إلى مشروعك الحالي بدون إدخال نصوص Oracle حرفيًا.

## ماذا يوجد داخل الحزمة؟

| الملف | الاستخدام |
|---|---|
| `docs/01-overview-requirements.md` | الفصل 1: النظرة العامة، الوحدات، الأدوار، لوحة الإدارة، العمليات، التكاملات. |
| `docs/02-maintenance-organization-requirements.md` | الفصل 2: منظمة الصيانة، مناطق العمل، الموارد، نسخ الموارد، مراكز العمل، الورديات. |
| `docs/03-assets-requirements.md` | الفصل 3: الأصول، أنواعها، الإنشاء، البحث، التحرير، الهياكل، الاستيراد، التكاملات. |
| `docs/04-asset-groups-requirements.md` | الفصل 4: قواعد مجموعات الأصول، المجموعات، الإسنادات، الانتهاء التلقائي، التخصيص. |
| `docs/05-meters-for-assets-requirements.md` | الفصل 5: قوالب العدادات، عدادات الأصول، القراءات، reset/rollover، التوقعات، REST/import/IoT. |
| `docs/domain-model-ch01-05.md` | نموذج الدومين والعلاقات للفصول 1–5. |
| `docs/api-contracts-ch01-05.md` | REST API مقترح للفصول 1–5. |
| `docs/backlog-ch01-05.md` | User Stories وAcceptance Criteria للفصول 1–5. |
| `data/requirements_ch01_05.json` | نسخة Machine-readable ليقرأها Cursor أو أدوات AI بسهولة. |
| `db/schema_ch01_05.sql` | مخطط SQL مبدئي PostgreSQL قابل للتحويل إلى Prisma/Laravel/Django/Dotnet/NestJS. |
| `.cursor/rules/maintenance-domain.mdc` | Rule file يعطي Cursor سياق الدومين أثناء العمل. |
| `prompts/cursor_import_prompt_ch05_ar.md` | Prompt عربي جاهز لإضافة الفصل 5 إلى مشروعك الحالي. |
| `prompts/cursor_import_prompt_ch05_en.md` | Prompt إنجليزي جاهز لإضافة الفصل 5. |

## طريقة الاستخدام مع GitHub وCursor

1. فك الضغط عن الحزمة.
2. انسخ المجلدات إلى مشروعك الحالي أو ارفعها كمجلد مستقل في GitHub.
3. افتح المشروع في Cursor.
4. افتح الملف `prompts/cursor_import_prompt_ch05_ar.md` إذا كان مشروعك يحتوي على الفصول 1–4.
5. أو افتح `prompts/cursor_import_prompt_ch01_05_ar.md` لتنفيذ السياق الكامل تدريجيًا.

## مبدأ التنفيذ المقترح للفصل 5

ابدأ بهذا الترتيب:

1. `meter_templates`
2. `meter_template_applicability`
3. `asset_meters`
4. `meter_readings`
5. خدمة حساب `net_change`, `displayed_reading`, `life_to_date`
6. تبويب Meters داخل صفحة الأصل
7. Reading History
8. reset/rollover
9. historical correction/recalculation
10. mass association
11. REST/import/IoT لاحقًا

## نطاق الفصل 5

الفصل 5 لا ينشئ برامج الصيانة الوقائية نفسها، لكنه يجهز بيانات العدادات التي ستستخدمها برامج الصيانة لاحقًا لتوقع تواريخ الاستحقاق وإنشاء أوامر العمل.



<!-- FILE: docs/01-overview-requirements.md -->

# الفصل 1 — Overview / النظرة العامة

## 1. نطاق الفصل

الفصل الأول يقدّم الخريطة العامة لنظام الصيانة. لا يشرح كل شاشة بالتفصيل، لكنه يحدد الوحدات الكبرى التي يجب أن تكون موجودة في النظام، ويعرّف الأدوار، صفحة إدارة الصيانة، الإجراءات، مؤشرات الأداء، عمليات سلسلة الإمداد، والتكاملات مع التطبيقات الأخرى.

في المشروع البرمجي، تعامل مع هذا الفصل كـ **Business Capability Map** للنظام.

---

## 2. الهدف العام للنظام

النظام يجب أن يساعد المؤسسة على:

- تعريف الأصول القابلة للصيانة.
- إدارة الصيانة الوقائية والمجدولة.
- التعامل مع الإصلاحات الطارئة عند حدوث أعطال.
- جعل عمليات الصيانة متكررة، واضحة، وقابلة للقياس.
- تسجيل المواد والموارد المستخدمة في الصيانة.
- ربط الصيانة بالتكلفة، المخزون، الشراء، المشاريع، والتقارير.

### متطلب برمجي

يجب بناء النظام على شكل وحدات مترابطة، وليس شاشة واحدة فقط. الحد الأدنى من الوحدات المستخرجة من الفصل:

| الوحدة | الغرض |
|---|---|
| Assets | تعريف وتتبع الأصول. |
| Maintenance Organization | إعداد الهيكل التشغيلي للصيانة. |
| Standard Operations | مكتبة عمليات صيانة قابلة لإعادة الاستخدام. |
| Work Definitions | قوالب عمليات الصيانة للأصول. |
| Work Orders | إدارة أوامر الصيانة والتنفيذ. |
| Work Execution | تسجيل تنفيذ العمليات والمواد والموارد. |
| Reports | طباعة وعرض التقارير. |
| Exceptions | إدارة المشاكل التي تعطل التنفيذ. |
| Imports | استيراد البيانات بكميات كبيرة. |
| Project-Driven Maintenance | دعم صيانة مرتبطة بمشاريع. |
| Supply Chain Integration | ربط المخزون والشراء والتكلفة والموردين. |

---

## 3. القدرات الأساسية للنظام

### 3.1 إنشاء وإدارة الأصول

الأصل هو كيان تتم صيانته، مثل آلة، مركبة، معدة، جهاز، خط إنتاج، أو أصل خاص بعميل. يجب أن يسمح النظام بإنشاء أصل وتحديثه وتتبع حالته وتاريخه.

#### متطلبات أولية

| المتطلب | الوصف |
|---|---|
| Asset Registry | سجل مركزي للأصول. |
| Asset Search | بحث وتصفية حسب رقم الأصل، الموقع، النوع، الحالة. |
| Asset Details | صفحة تفاصيل تعرض البيانات الأساسية، الموقع، الحالة، والأحداث. |
| Asset Meters | عدادات استخدام مثل ساعات تشغيل أو عدد دورات. |
| Asset History | سجل أوامر العمل والتكاليف والحركات. |

> الفصول اللاحقة تفصل الأصول بشكل أعمق. في الفصل الأول نحتاج فقط إلى تجهيز مكانها داخل الخريطة العامة.

---

### 3.2 إعداد منظمة الصيانة

قبل إنشاء أوامر عمل فعلية، يجب وجود منظمة صيانة تحتوي على مناطق عمل، مراكز عمل، وموارد.

#### متطلبات أولية

| المتطلب | الوصف |
|---|---|
| Maintenance Organization | منظمة أو موقع يتم فيه تنفيذ أعمال الصيانة. |
| Plant Parameters | إعدادات تشغيلية للمنظمة. |
| Work Areas | مناطق تنفيذ الصيانة. |
| Work Centers | وحدات تنفيذ داخل مناطق العمل. |
| Resources | عمالة، معدات، أدوات. |
| Resource Assignment | ربط الموارد بمراكز العمل والورديات. |

التفصيل الكامل لهذه النقطة موجود في ملف الفصل 2.

---

### 3.3 العمليات القياسية Standard Operations

العملية القياسية هي قالب جاهز لخطوة صيانة يمكن استخدامها في أكثر من تعريف عمل أو أمر عمل. مثال: فحص المحرك، تغيير فلتر، تشحيم، اختبار كهربائي.

#### حقول مقترحة

| الحقل | الوصف |
|---|---|
| code | كود فريد للعملية. |
| name | اسم العملية. |
| description | وصف مختصر. |
| operation_type | داخلية أو مورد خارجي. |
| work_center_id | مركز العمل الافتراضي. |
| duration | المدة المتوقعة. |
| resources | الموارد المطلوبة. |
| materials | المواد المطلوبة. |
| attachments | ملفات، روابط، صور تعليمية. |
| status | Active / Inactive. |

---

### 3.4 تعريفات العمل Maintenance Work Definitions

تعريف العمل هو قالب صيانة كامل لأصل أو نوع أصل. يحتوي على العمليات، الخطوات، المواد، والموارد. عند إنشاء أمر عمل من تعريف عمل، يتم نقل هذه التفاصيل تلقائيًا.

#### متطلبات أولية

| المتطلب | الوصف |
|---|---|
| Work Definition Header | تعريف عام للقالب. |
| Work Definition Operations | العمليات المرتبة داخل القالب. |
| Materials | المواد المطلوبة لكل عملية. |
| Resources | الموارد المطلوبة لكل عملية. |
| Versioning | دعم الإصدارات، لأن القوالب تتغير. |
| Attachments | مستندات وتعليمات. |

---

### 3.5 أوامر العمل Maintenance Work Orders

أمر العمل هو نقطة بدء تنفيذ الصيانة. يحتوي على الأصل، العمليات، المواد، الموارد، الأولوية، الحالة، وتواريخ التخطيط والتنفيذ.

#### حالات مقترحة

| الحالة | المعنى |
|---|---|
| Draft | مسودة داخل النظام قبل الاعتماد. |
| Unreleased | أمر عمل مخطط ولم ينتقل للتنفيذ. |
| Released | جاهز للتنفيذ. |
| On Hold | معلق بسبب مادة أو مورد أو قرار إداري. |
| In Process | قيد التنفيذ. |
| Completed | اكتمل تنفيذ العمليات. |
| Closed | مغلق ولا يسمح بتحديثات تشغيلية. |
| Canceled | ملغي. |

#### إجراءات رئيسية

| الإجراء | الوصف |
|---|---|
| Create | إنشاء أمر صيانة. |
| Edit | تعديل التفاصيل قبل الإغلاق. |
| Release | إطلاق الأمر للتنفيذ. |
| Put on Hold | تعليق الأمر. |
| Complete | إكمال الأمر. |
| Close | إغلاق الأمر ونقل التكلفة. |
| Mass Update | تعديل حالة أو أولوية عدة أوامر. |
| Review Cost | مراجعة التكلفة بعد التنفيذ. |

---

### 3.6 تنفيذ الصيانة Work Execution

التنفيذ هو تسجيل ما حدث فعليًا أثناء الصيانة.

#### معاملات التنفيذ

| المعاملة | الوصف |
|---|---|
| Operation Transaction | تسجيل تقدم أو إكمال عملية. |
| Material Transaction | صرف أو إرجاع مواد. |
| Resource Transaction | تسجيل وقت أو استخدام مورد. |
| Dispatch List | قائمة العمليات الجاهزة أو التي تحتاج انتباه. |
| Transaction History | سجل كامل للحركات. |
| Transfer to Costing | نقل الحركات إلى التكلفة بعد الإغلاق. |

---

### 3.7 التقارير Reports

الفصل يذكر ثلاثة تقارير رئيسية يجب تجهيزها لاحقًا:

| التقرير | المحتوى |
|---|---|
| Maintenance Work Definition Report | تفاصيل قوالب/تعريفات الصيانة. |
| Material List Report | قائمة المواد المطلوبة لأوامر العمل. |
| Work Order Details Report | تفاصيل أمر العمل: الرأس، العمليات، المواد، الموارد، المرفقات. |

#### متطلبات برمجية

- دعم توليد PDF أو HTML.
- دعم Scheduled Jobs.
- حفظ سجل طلبات التقارير.
- صلاحيات منفصلة لطباعة التقارير.

---

### 3.8 الاستثناءات Maintenance Exceptions

الاستثناء يمثل مشكلة تؤثر على أمر العمل أو العملية، مثل عدم توفر مادة أو مورد.

#### متطلبات أولية

| المتطلب | الوصف |
|---|---|
| Create Exception | إنشاء استثناء بسبب مشكلة. |
| Link Operations | ربط العمليات المتأثرة بالاستثناء. |
| Notify Users | إشعار المستخدمين المعنيين. |
| Resolve Exception | حل الاستثناء. |
| Close Exception | إغلاق الاستثناء بعد المعالجة. |
| History | حفظ تاريخ الاستثناءات. |

---

### 3.9 الاستيراد Imports

النظام يجب أن يدعم إدخال بيانات كبيرة دفعة واحدة.

#### ملفات/عمليات الاستيراد المطلوبة لاحقًا

| نوع الاستيراد | الغرض |
|---|---|
| Import Assets | استيراد الأصول. |
| Import Work Definitions | استيراد قوالب الصيانة. |
| Import Work Orders | استيراد أوامر العمل. |
| Import Meter Readings | استيراد قراءات العدادات. |
| Import Maintenance Programs | استيراد البرامج ومتطلبات العمل. |
| Purge Interface Records | حذف سجلات الواجهة بعد فشل أو انتهاء المعالجة. |

---

## 4. الأدوار والصلاحيات

الفصل يذكر دورين أساسيين: مدير الصيانة وفني الصيانة. لا يوصى بمنح الدور الجاهز مباشرة كما هو؛ الأفضل نسخه وتخصيص صلاحياته حسب احتياج المؤسسة.

### 4.1 Maintenance Manager

مسؤول عن إدارة قسم الصيانة والتأكد من وجود البرامج، إكمال الأوامر في وقتها، معالجة الطوارئ، وتوفير القطع والأدوات.

#### مسؤولياته

- التواصل مع الفنيين حول الأعمال المجدولة.
- التعامل مع أوامر الطوارئ.
- مراقبة إكمال أوامر الصيانة.
- تعريف الأصول القابلة للصيانة.
- وضع استراتيجية الصيانة للأصول.
- إنشاء برامج الصيانة والتعريفات والعمليات القياسية.
- التأكد من توفر القطع والأدوات.
- مراجعة تكلفة أوامر العمل وتاريخها.
- مراجعة تاريخ الأصل.

### 4.2 Maintenance Technician

مسؤول عن تنفيذ أعمال الصيانة والإصلاح في الترتيب الصحيح وفي الوقت المطلوب.

#### مسؤولياته

- معرفة أوامر العمل المطلوبة لليوم أو الأسبوع.
- مراجعة بيانات أمر العمل وقائمة المواد وتوفر القطع.
- تنفيذ الصيانة أو الإصلاح.
- التعامل مع الأعمال الطارئة.
- تحديث وإكمال أمر العمل.
- تسجيل الوقت والمواد المستخدمة.
- إضافة الملاحظات الفنية.

### 4.3 مصفوفة صلاحيات مقترحة

| الوظيفة | Manager | Technician |
|---|---:|---:|
| إنشاء/تعديل الأصول | نعم | محدود |
| إنشاء أوامر العمل | نعم | أحيانًا حسب الصلاحية |
| إطلاق أو إيقاف أمر عمل | نعم | محدود |
| إغلاق أمر عمل | نعم | لا غالبًا |
| تنفيذ عملية | نعم | نعم |
| صرف وإرجاع مواد | نعم | نعم |
| تسجيل موارد | نعم | نعم |
| مراجعة تكلفة | نعم | لا |
| إدارة إعدادات الصيانة | نعم | لا |
| طباعة التقارير | نعم | نعم لبعض التقارير |

---

## 5. صفحة إدارة الصيانة Maintenance Management Landing Page

الصفحة الرئيسية تعطي نظرة سريعة على عمليات الصيانة للمنظمة المحددة. يجب أن تعرض بطاقات معلومات قابلة للتفاعل، وليس مجرد أرقام ثابتة.

### 5.1 خصائص Infolets

- عرض مؤشرات مختصرة.
- إمكانية فتح التفاصيل.
- إمكانية الانتقال إلى صفحة الإدارة المناسبة.
- إمكانية إخفاء البطاقات.
- إمكانية إعادة ترتيب البطاقات.
- إمكانية تخصيص عرض المستخدم.

### 5.2 البطاقات الرئيسية

| Infolet | ما يعرضه | صفحة الانتقال |
|---|---|---|
| Work Orders | أوامر العمل بحالة Released، مع أولوية/إجمالي/متأخر. | Manage Maintenance Work Orders |
| Scheduled vs Completed Work | مقارنة أوامر الأسبوع المجدولة والمكتملة/المغلقة. | Manage Maintenance Work Orders |
| Work Completion | أوامر مكتملة/مغلقة، وخاصة المتأخرة. | Manage Maintenance Work Orders |
| Operations | عمليات جاهزة أو متأخرة. | Maintenance Dispatch List |
| Released Work Orders | أعلى 5 مراكز عمل حسب حجم أوامر Released. | Manage Maintenance Work Orders |
| Work Orders with Work Definition | أوامر مرتبطة بتعريف عمل خلال آخر 6 أشهر. | Manage Maintenance Work Orders |
| Assets with Most Work Orders | الأصول ذات أكبر عدد أوامر خلال آخر 6 أشهر. | Manage Maintenance Work Orders |
| Past Due Operations | العمليات المتأخرة حسب أعلى 5 مراكز عمل. | Maintenance Dispatch List |
| Recommendations | توصيات تحسين برامج الصيانة إذا كانت مفعلة. | Recommendations Page |

---

## 6. Task Navigator / Actions

الفصل يصف قائمة مهام للوصول إلى الإعداد، الإدارة، والتنفيذ. في مشروعك يمكن تحويلها إلى Sidebar أو Dashboard Actions.

### 6.1 Asset and Work Definition

| Task | الغرض |
|---|---|
| Manage Assets | إنشاء وتعديل وعرض وبحث الأصول. |
| Hierarchy Navigator | بناء هياكل منطقية للأصول مثل مصنع/خط إنتاج/أسطول. |
| Print Maintenance Work Definition Report | تشغيل تقرير تعريفات العمل. |
| Manage Asset Groups | إدارة مجموعات الأصول وقواعدها. |
| Manage Meter Templates | إدارة قوالب العدادات وربطها تلقائيًا بالأصول. |

### 6.2 Work Management

| Task | الغرض |
|---|---|
| Manage Maintenance Work Orders | إنشاء وتعديل وبحث وإطلاق وتعليق أوامر العمل، الإجراءات الجماعية، الاستثناءات، التكاليف، التقارير. |
| Material Availability Rules | قواعد اقتراح أي أوامر يمكن إطلاقها عند ندرة المواد. |
| Material Availability Assignments | Workbench لضمان توفر المواد قبل إطلاق العمل. |
| Manage Maintenance Exceptions | إنشاء وإدارة الاستثناءات. |
| Print Material List | تقرير المواد لأمر أو أكثر. |
| Print Work Order Details | تقرير تفاصيل أمر العمل. |
| Review Maintenance Transaction History | عرض تاريخ الحركات. |
| Close Maintenance Work Orders | إغلاق أمر أو عدة أوامر ومنع تحديثها وإرسال التكلفة. |
| Manage Production Calendar | عرض تقويم الإنتاج والورديات. |
| Manage Work Center Resource Calendar | عرض تقويم مركز العمل والموارد والاستثناءات. |

### 6.3 Work Execution

| Task | الغرض |
|---|---|
| Review Maintenance Dispatch List | عرض وتنفيذ عمليات أمر العمل الجاهزة أو قيد التنفيذ أو المكتملة. |
| Create Inspection Results | إدخال نتائج تفتيش Ad-hoc. |
| Manage Inspections | إنشاء وإدارة مهام تفتيش أثناء العمل. |
| Pick Materials for Work Orders | التقاط/تجهيز المواد لأوامر Released. |
| Issue and Return Materials from Inventory | صرف وإرجاع المواد. |
| Report Resource Transactions | تسجيل استخدام الموارد. |
| Transfer Transactions from Maintenance to Costing | نقل الحركات للتكلفة للأوامر المغلقة. |

### 6.4 Maintenance Programs

| Task | الغرض |
|---|---|
| Manage Maintenance Programs | إنشاء وإدارة برامج الصيانة. |
| Generate Maintenance Forecast | توليد توقعات الصيانة حسب نافذة زمنية. |
| Manage Maintenance Forecasts | عرض وتحديث تواريخ الاستحقاق المتوقعة. |
| Generate Maintenance Work Orders | إنشاء أوامر عمل من التوقعات. |

### 6.5 Supplier Warranty

| Task | الغرض |
|---|---|
| Manage Coverages | إدارة تغطيات ضمان المورد. |
| Manage Contracts | إدارة عقود الضمان. |
| Manage Claims | إدارة مطالبات الضمان. |
| Manage Labor Reimbursement Rates | معدلات تعويض العمالة. |
| Manage Standard Repair Times | أوقات الإصلاح القياسية. |

### 6.6 Imports

| Task | الغرض |
|---|---|
| Load Interface Files for Import | تحميل ملفات الاستيراد إلى الواجهة. |
| Import Assets | استيراد الأصول. |
| Import Work Definitions | استيراد تعريفات العمل. |
| Import Work Orders | استيراد أوامر العمل. |
| Import Meter Readings | استيراد قراءات العدادات. |
| Import Maintenance Programs | استيراد برامج الصيانة ومتطلبات العمل. |
| Purge Interface Records | حذف سجلات واجهة الاستيراد. |

### 6.7 Maintenance Setup

| Task | الغرض |
|---|---|
| Manage Maintenance Work Areas | إدارة مناطق العمل. |
| Manage Maintenance Work Centers | إدارة مراكز العمل. |
| Manage Maintenance Resources | إدارة العمالة والمعدات والموارد. |
| Manage Maintenance Standard Operations | إدارة قوالب العمليات. |
| Manage Standard Operations in Spreadsheet | إنشاء/تحديث العمليات عبر Spreadsheet. |
| Manage Condition Event Codes | إعداد أكواد أحداث الحالة لتكامل مراقبة الأصول. |
| Manage Work Order Statuses | إعداد حالات أوامر العمل المخصصة. |
| Manage Asset Group Rules | قواعد مجموعات الأصول. |
| Create Logical Hierarchy | إنشاء هياكل منطقية للأصول. |
| Manage Qualification Requirements | متطلبات التأهيل. |
| Manage Qualification Profiles | ملفات التأهيل. |
| Manage Failure Sets | مجموعات الفشل للتحليل أثناء التنفيذ. |

---

## 7. Redwood Landing Page / الصفحة الحديثة

الفصل يذكر صفحة حديثة لإدارة الصيانة تركز على:

- عرض شامل لجميع أنشطة الصيانة.
- إبراز أوامر العمل التي تحتاج انتباهًا عاجلًا.
- إجراءات سريعة حسب منظمة الصيانة الافتراضية للمستخدم.
- إمكانية التبديل بين منظمات الصيانة.
- بحث قوي في أوامر العمل.
- تثبيت الإجراءات المستخدمة بكثرة.
- إضافة KPIs ورسوم OTBI لاحقًا.
- Guided Journeys لإرشاد المستخدم خلال المهام.
- حفظ عمليات البحث حسب KPI.

### 7.1 KPIs الأساسية

| KPI | التعريف البرمجي المقترح |
|---|---|
| Current Work Orders | أوامر بدأت حتى نهاية اليوم وليست Canceled/Closed/Completed. |
| Past-Due Work Orders | أوامر ليست Canceled/Closed/Completed وتاريخ إنجازها المخطط قبل اليوم. |
| Future Work Orders | أوامر ليست Canceled/Closed/Completed وبداية مخططة بعد اليوم ضمن نافذة أيام، الافتراضي 30 يومًا. |

### 7.2 متطلبات UI

| الميزة | المطلوب |
|---|---|
| Organization Context | كل KPI وAction يعمل حسب منظمة محددة. |
| KPI Drilldown | عند الضغط على KPI تعرض قائمة أوامر العمل. |
| Saved Searches | حفظ فلاتر شخصية أو مشتركة حسب KPI. |
| Pinned Actions | تثبيت الإجراءات المستخدمة بكثرة. |
| Custom Widgets | دعم إضافة رسوم/جداول لاحقًا. |
| Guided Journey | خطوات إرشادية للمستخدم، اختياري في المرحلة الأولى. |

---

## 8. الصيانة داخل عمليات سلسلة الإمداد SCM

### 8.1 Outside Processing

بعض عمليات أمر العمل يمكن تنفيذها عند مورد خارجي.

#### مسار العمل

1. إنشاء وإطلاق أمر عمل يحتوي عملية مورد خارجي.
2. إرسال طلب إلى Supply Chain Orchestration.
3. إنشاء طلب شراء وأمر شراء.
4. شحن الأصل أو الجزء للمورد.
5. استلامه بعد التنفيذ.
6. تسجيل الإكمال والتكلفة.

### 8.2 Direct Procurement of Materials

عند الحاجة لمواد غير مخططة أثناء عطل أو بعد التفكيك، يمكن شراء المادة مباشرة وربطها بأمر العمل والعملية.

#### متطلبات

- ربط Requisition بأمر العمل.
- ربط Purchase Order بأمر العمل.
- عرض أوامر الشراء والاستلام داخل صفحة أمر العمل.
- تسليم المادة مباشرة لأمر العمل.

### 8.3 Pick Materials for Work Orders

إذا كانت المواد في مخزن مركزي، يجب نقلها إلى مخزون/مستودع أرضية الصيانة قبل الاستهلاك.

#### متطلبات

- إنشاء Movement Request للمواد المطلوبة.
- دعم كميات كاملة أو جزئية حسب المتاح.
- تأكيد الالتقاط ثم نقل المواد إلى Supply Subinventory.
- لاحقًا يصرفها الفني لأمر العمل.

### 8.4 Reservation of Work Order Materials

تحتاج المؤسسة إلى حجز المواد لأمر عمل محدد لتقليل التوقف والالتزام بالصيانة الوقائية.

#### أنواع الحجز

| النوع | الوصف |
|---|---|
| High-Level Reservation | حجز كمية من صنف. |
| Detailed Reservation | حجز تفصيلي حتى مستوى المخزن/الموقع/الدفعة/الرقم التسلسلي. |

### 8.5 Project-Driven Supply Chain

إذا كانت المنظمة Project-tracked، يجب دعم:

- أوامر صيانة مرتبطة بمشروع.
- صرف مواد من مخزون عام أو خاص بالمشروع.
- شراء خدمات خارجية على أمر عمل مرتبط بمشروع.
- إرسال تكلفة المواد والموارد إلى المشروع.

---

## 9. التكاملات مع الأنظمة الأخرى

| النظام | دوره في الصيانة |
|---|---|
| Asset Lifecycle Management | مصدر مركزي لمعلومات الأصول وإنشاء الأصول عند الاستلام. |
| Product Hub | الأصناف والهياكل المستخدمة في تعريفات العمل وأوامر العمل والمواد. |
| SCM Common Components | UOM، مواقع، مخازن، تقويمات، ورديات، استثناءات. |
| Inventory Management | إدارة المواد، الحجز، الصرف، الإرجاع، وتحديث التوفر. |
| Cost Management | تكلفة المواد والموارد وأمر العمل. |
| IoT Asset Monitoring | أعطال من الحساسات، Digital Twin، تحديث قراءات العدادات. |
| Service Logistics | صيانة أصول العملاء ميدانيًا أو عبر Depot Repair. |
| B2B Service | استخدام Installed Base Asset في طلبات الخدمة وربطه بالعمليات اللاحقة. |

---

## 10. كيانات قاعدة بيانات مستخرجة من الفصل 1

| الكيان | لماذا نحتاجه؟ |
|---|---|
| users | المستخدمون. |
| roles | الأدوار. |
| permissions | الصلاحيات. |
| maintenance_organizations | منظمة الصيانة. |
| assets | الأصول. |
| asset_meters | عدادات الأصول. |
| standard_operations | العمليات القياسية. |
| work_definitions | قوالب الصيانة. |
| work_orders | أوامر العمل. |
| work_order_operations | عمليات أمر العمل. |
| work_order_materials | مواد أمر العمل. |
| work_order_resources | موارد أمر العمل. |
| execution_transactions | معاملات التنفيذ. |
| maintenance_exceptions | الاستثناءات. |
| report_jobs | طلبات التقارير. |
| import_batches | دفعات الاستيراد. |
| procurement_links | مراجع الشراء. |
| inventory_reservations | حجوزات المواد. |
| cost_records | سجلات التكلفة. |
| project_links | ربط المشاريع. |

---

## 11. Acceptance Criteria للفصل 1

- يستطيع المستخدم رؤية Dashboard حسب منظمة الصيانة.
- تظهر KPIs أساسية للأوامر الحالية، المتأخرة، والمستقبلية.
- توجد صلاحيات Manager و Technician قابلة للتخصيص.
- توجد قائمة مهام/إجراءات منظمة حسب الوحدات.
- النظام يسمح بإنشاء أوامر عمل وربطها بأصل وعمليات ومواد وموارد.
- النظام يحتفظ بتاريخ الحركات.
- النظام يدعم مفهوم الاستثناءات.
- النظام يدعم تصميم مستقبلي للاستيراد والتقارير والتكلفة والتكاملات.
- لا يتم بناء الفصول اللاحقة بالكامل من هذا الفصل، بل تترك كواجهات وحدودية واضحة.



<!-- FILE: docs/02-maintenance-organization-requirements.md -->

# الفصل 2 — Maintenance Organization / منظمة الصيانة

## 1. نطاق الفصل

الفصل الثاني يشرح الهيكل التشغيلي الذي يجب أن يكون موجودًا قبل إنشاء أوامر العمل. أي نظام صيانة يحتاج إلى منظمة، مناطق، مراكز، موارد، ونسخ موارد فعلية.

في المشروع البرمجي، تعامل مع هذا الفصل كـ **Setup Module** أو **Master Data Module**.

---

## 2. تعريف منظمة الصيانة

منظمة الصيانة هي غالبًا منظمة مخزون يتم فيها تنفيذ صيانة وإصلاح الأصول. لكي تصبح المنظمة صالحة للصيانة، يجب إعدادها أولًا كمنظمة مخزون، ثم تصنيفها كمنظمة صيانة.

### متطلبات أساسية

| المتطلب | الوصف |
|---|---|
| Inventory Organization Link | ربط منظمة الصيانة بمنظمة مخزون. |
| Maintenance Enabled Flag | تفعيل المنظمة للصيانة. |
| Plant Parameters | إعدادات تشغيلية للمنظمة. |
| Lookups | قيم مرجعية للحالات والأنواع. |
| Work Areas | منطقة عمل واحدة على الأقل. |
| Work Centers | مركز عمل واحد على الأقل. |
| Project Tracking | تفعيل اختياري إذا كانت الصيانة مرتبطة بمشاريع. |

---

## 3. ترتيب الإعداد الصحيح

الفصل يحدد ترتيبًا مفضلًا للإعداد:

1. إنشاء مناطق العمل Work Areas.
2. إنشاء الموارد Resources.
3. إنشاء مراكز العمل Work Centers وربط كل مركز بمنطقة عمل.
4. تخصيص الموارد لمراكز العمل، مع إمكانية ربط الورديات وتقويم موارد مركز العمل.

### قاعدة برمجية

لا تسمح بتشغيل منظمة الصيانة تشغيليًا إلا بعد وجود:

- Work Area واحدة على الأقل.
- Work Center واحد على الأقل.

---

## 4. Maintenance Organization Entity

### الحقول المقترحة

| الحقل | النوع | مطلوب | ملاحظات |
|---|---|---:|---|
| id | UUID/Number | نعم | معرف داخلي. |
| code | String | نعم | فريد. |
| name | String | نعم | اسم المنظمة. |
| inventory_org_id | UUID/Number | نعم | الربط بمنظمة مخزون. |
| is_maintenance_enabled | Boolean | نعم | تفعيل الصيانة. |
| is_project_tracked | Boolean | لا | دعم المشاريع. |
| timezone | String | نعم | مهم للورديات. |
| default_calendar_id | UUID/Number | لا | التقويم الافتراضي. |
| status | Enum | نعم | Active / Inactive. |
| inactive_on | Date | لا | تاريخ التعطيل. |
| created_at | Timestamp | نعم | إنشاء. |
| updated_at | Timestamp | نعم | تعديل. |

### قواعد تحقق

- `code` يجب أن يكون فريدًا.
- لا يمكن تفعيل المنظمة بدون Work Area و Work Center.
- لا يمكن حذف منظمة مستخدمة في أوامر عمل أو أصول.
- إذا كانت `is_project_tracked = true` يجب دعم حقول المشروع في أوامر العمل والموارد لاحقًا.

---

## 5. Work Areas / مناطق العمل

منطقة العمل تمثل تقسيمًا فيزيائيًا، جغرافيًا، أو منطقيًا داخل منظمة الصيانة. مثال: ورشة كهرباء، ورشة ميكانيكا، خط إنتاج، مبنى، قسم.

### الوظائف المطلوبة

| الوظيفة | الوصف |
|---|---|
| Create Work Area | إنشاء منطقة باسم وكود فريد. |
| Edit Work Area | تعديل الاسم أو الوصف أو التاريخ. |
| Deactivate/Reactivate | باستخدام حقل `inactive_on`. |
| Delete Work Area | مسموح فقط حسب القيود. |
| Search/List | بحث وتصفية داخل المنظمة. |

### الحقول المقترحة

| الحقل | النوع | مطلوب |
|---|---|---:|
| id | UUID/Number | نعم |
| organization_id | FK | نعم |
| code | String | نعم |
| name | String | نعم |
| description | Text | لا |
| status | Enum | نعم |
| inactive_on | Date | لا |
| created_at | Timestamp | نعم |
| updated_at | Timestamp | نعم |

### قواعد العمل

- الاسم والكود فريدان داخل المنظمة.
- يجب وجود منطقة واحدة على الأقل لكل منظمة صيانة.
- إذا تم تعطيل Work Area لا تظهر في الإنشاءات الجديدة.
- يمكن حذف/تعطيل Work Area فقط إذا:
  - لا تحتوي Work Centers، أو
  - لا تحتوي Work Centers نشطة.

---

## 6. Resources / الموارد

المورد هو عمالة أو معدات أو أداة مخصصة لمركز عمل. الفصل يصنف المورد إلى نوعين رئيسيين: Labor و Equipment.

### أنواع الموارد

| النوع | الوصف | أمثلة |
|---|---|---|
| Labor | فني أو عامل أو مورد بشري. | فني كهرباء، فني ميكانيكا. |
| Equipment | معدة أو أداة تستخدم في الصيانة. | رافعة، جهاز اختبار، آلة لحام. |

### الوظائف المطلوبة

| الوظيفة | الوصف |
|---|---|
| Create Resource | إنشاء مورد بكود واسم فريدين. |
| Edit Resource | تعديل الخصائص المسموحة. |
| Deactivate/Reactivate | باستخدام inactive_on. |
| Delete Resource | مسموح فقط حسب القيود. |
| Manage Resource Instances | إدارة النسخ التفصيلية للمورد. |

### الحقول المقترحة

| الحقل | النوع | مطلوب | ملاحظات |
|---|---|---:|---|
| id | UUID/Number | نعم | معرف داخلي. |
| organization_id | FK | نعم | المنظمة. |
| code | String | نعم | فريد. |
| name | String | نعم | اسم المورد. |
| type | Enum | نعم | Labor / Equipment. |
| usage_uom_id | FK/String | نعم | وحدة قياس الاستخدام. |
| default_expenditure_type_id | FK/String | لا | للمشاريع والتكلفة. |
| status | Enum | نعم | Active / Inactive. |
| inactive_on | Date | لا | التعطيل. |

### قواعد Usage UOM

- تمثل وحدة قياس الاستخدام المخطط والفعلي للمورد.
- تستخدم لاحقًا في Work Definition و Work Order.
- للموارد المجدولة يفضل أن تكون من فئة وقت مثل Hours أو Minutes.
- لا يمكن تغيير Usage UOM بعد ربط المورد بمركز عمل.

### قواعد الحذف والتعطيل

| الإجراء | القاعدة |
|---|---|
| Deactivate | تحديث inactive_on. |
| Reactivate | إزالة أو تعديل inactive_on. |
| Delete | مسموح فقط إذا لم يكن المورد مرتبطًا بأي Work Center ولم يكن له Resource Instance نشطة. |
| Change Usage UOM | ممنوع بعد ربط المورد بمركز عمل. |

---

## 7. Resource Instances / نسخ الموارد

Resource Instance هي تمثيل تفصيلي للمورد. المورد العام قد يكون “فني كهرباء”، أما النسخة فهي “أحمد - فني كهرباء”. المورد العام قد يكون “رافعة”، أما النسخة فهي “رافعة FL-001”.

### خصائص عامة

- لكل Instance كود/معرف واسم فريد.
- قد ترتبط أو لا ترتبط بمركز عمل.
- نوعها يتبع نوع المورد: Labor أو Equipment.

---

## 8. Labor Resource Instances

تمثل شخصًا يعمل في الصيانة.

### Person Types المدعومة

| النوع | المصدر المتوقع |
|---|---|
| Employee | نظام الموارد البشرية. |
| Contingent Worker | نظام الموارد البشرية. |
| Partner Contact | CRM / نموذج الأطراف. |

### قواعد مهمة

- Labor Resource Instance يمكن ربطها بمورد واحد فقط.
- يمكن اختيار شخص موجود، أو إنشاء نسخة يدويًا.
- إذا تم اختيار شخص، يتم تعبئة identifier و name تلقائيًا، مع بقاء identifier فريدًا.

### حقول مقترحة

| الحقل | النوع | مطلوب |
|---|---|---:|
| id | UUID/Number | نعم |
| resource_id | FK | نعم |
| organization_id | FK | نعم |
| type | Enum | نعم: Labor |
| identifier | String | نعم |
| name | String | نعم |
| person_id | FK/String | لا |
| person_type | Enum | لا |
| primary_work_center_id | FK | لا |
| inactive_on | Date | لا |
| status | Enum | نعم |

### خطوات الإنشاء

1. اختيار المورد العام.
2. إضافة Resource Instance.
3. اختيار شخص من النظام أو إدخال يدوي.
4. تعبئة identifier و name.
5. اختيار Primary Work Center اختياريًا.
6. حفظ.

---

## 9. Equipment Resource Instances

تمثل معدة أو آلة مستخدمة في الصيانة.

### قواعد مهمة

- يمكن ربط Equipment Instance بأصل Asset.
- يجب أن يكون الأصل معرفًا في موقع مناسب لمنظمة الصيانة وبنوع موقع Work Center.
- إذا كانت ميزة تأهيل المعدات مطلوبة، يجب ربط Asset Number بالـ Equipment Resource Instance.
- عند اختيار أصل، يتم تعبئة identifier و name و work center تلقائيًا من الأصل، مع بقاء identifier فريدًا.

### حقول مقترحة

| الحقل | النوع | مطلوب |
|---|---|---:|
| id | UUID/Number | نعم |
| resource_id | FK | نعم |
| organization_id | FK | نعم |
| type | Enum | نعم: Equipment |
| identifier | String | نعم |
| name | String | نعم |
| asset_id | FK/String | لا |
| asset_number | String | لا |
| primary_work_center_id | FK | لا، موصى به |
| inactive_on | Date | لا |
| status | Enum | نعم |

### خطوات الإنشاء

1. اختيار المورد العام.
2. إضافة Resource Instance.
3. اختيار Asset أو إدخال يدوي.
4. تعبئة identifier و name.
5. اختيار Primary Work Center، ويفضل أن يكون موجودًا.
6. حفظ.

---

## 10. Work Centers / مراكز العمل

مركز العمل هو وحدة تنفيذ صيانة تتكون من أشخاص أو معدات بقدرات متشابهة. كل مركز عمل يرتبط بمنطقة عمل صالحة.

### الوظائف المطلوبة

| الوظيفة | الوصف |
|---|---|
| Create Work Center | إنشاء مركز عمل وربطه بمنطقة عمل. |
| Edit Work Center | تعديل البيانات. |
| Deactivate/Reactivate | باستخدام inactive_on. |
| Delete Work Center | مسموح فقط إذا لم يكن مستخدمًا. |
| Add Resources | ربط الموارد بالمركز. |
| Allocate Shifts | تحديد توفر الموارد حسب الوردية. |
| Manage Resource Exceptions | إدارة استثناءات موارد المركز. |

### الحقول المقترحة

| الحقل | النوع | مطلوب |
|---|---|---:|
| id | UUID/Number | نعم |
| organization_id | FK | نعم |
| work_area_id | FK | نعم |
| code | String | نعم |
| name | String | نعم |
| description | Text | لا |
| status | Enum | نعم |
| inactive_on | Date | لا |
| created_at | Timestamp | نعم |
| updated_at | Timestamp | نعم |

### قواعد العمل

- code و name يجب أن يكونا فريدين داخل المنظمة.
- work_area_id يجب أن يشير إلى Work Area نشطة.
- لا يمكن حذف Work Center إذا:
  - لديه موارد مرتبطة.
  - مستخدم في Work Definition Operation.
  - مستخدم في Work Order Operation.

---

## 11. ربط الموارد بمراكز العمل

بعد إنشاء Work Center، يمكن إضافة Resources إليه وتحديد الكمية، التوفر، الورديات، الكفاءة، والاستفادة.

### الحقول المطلوبة عند الربط

| الحقل | الوصف |
|---|---|
| resource_id | المورد المرتبط. |
| inactive_on | تاريخ تعطيل المورد داخل المركز. |
| default_units_available | عدد وحدات المورد المتاحة في المركز. |
| available_24_hours | هل المورد متاح 24 ساعة؟ |
| check_capable_to_promise | هل يحتسب في الوعد بالتسليم/التوفر؟ |
| utilization_percent | نسبة وقت المورد المتاحة للعمل. |
| efficiency_percent | كفاءة المورد في إكمال المهمة. |

### جدول الربط المقترح

| الحقل | النوع |
|---|---|
| id | UUID/Number |
| work_center_id | FK |
| resource_id | FK |
| default_units_available | Decimal |
| available_24_hours | Boolean |
| check_capable_to_promise | Boolean |
| utilization_percent | Decimal |
| efficiency_percent | Decimal |
| inactive_on | Date |
| status | Enum |

---

## 12. Utilization و Efficiency

القيم الافتراضية هي 100%. إذا انخفضت أي منهما عن 100%، يجب أن تطول مدة الجدولة.

### المعادلة

```text
Scheduled Duration = Required Usage / (Utilization × Efficiency)
```

على أن يتم تحويل النسب إلى كسور:

```text
50% = 0.5
```

### مثال

| Required Usage | Utilization | Efficiency | Scheduled Duration |
|---:|---:|---:|---:|
| 1 ساعة | 100% | 100% | 1 ساعة |
| 1 ساعة | 50% | 100% | 2 ساعة |
| 1 ساعة | 50% | 50% | 4 ساعات |
| 2 ساعة | 80% | 50% | 5 ساعات |

### قاعدة برمجية

- لا تسمح بقيمة 0 أو سالبة للكفاءة أو الاستفادة إذا كانت ستستخدم في الجدولة.
- القيم يجب أن تكون بين 1 و 100، أو استخدم Validation خاص إذا أردت السماح بتجاوز 100 لبعض السيناريوهات.

---

## 13. Resource Allocation حسب الورديات

إذا لم يكن المورد متاحًا 24 ساعة، فإنه يكون متاحًا فقط ضمن الورديات المرتبطة به.

### سيناريوهات منطقية يجب دعمها

| السيناريو | التطبيق |
|---|---|
| مورد R1 متاح 24 ساعة | `available_24_hours = true` ولا يتم توزيع ورديات عليه. |
| R2 متاح في النهار فقط | Day Shift = 2، Night Shift = 0. |
| R3 وحدة نهار ووحدة ليل | Day Shift = 1، Night Shift = 1. |
| R4 كل وحداته في النهار والليل | Day Shift = 2، Night Shift = 2. |

### جدول الورديات المقترح

| الحقل | النوع |
|---|---|
| id | UUID/Number |
| work_center_resource_id | FK |
| shift_id | FK |
| available_units | Decimal |
| effective_from | Date |
| effective_to | Date |

### قواعد تحقق

- إذا `available_24_hours = true` لا تسمح بإضافة Shift Allocations.
- مجموع الوحدات لكل وردية لا يجب أن يتجاوز `default_units_available` إلا إذا كانت سياسة النظام تسمح بذلك.
- لا تستخدم موردًا معطلًا في توزيع ورديات جديد.

---

## 14. Work Center Resource Calendar & Exceptions

الفصل يذكر إمكانية إدارة استثناءات الموارد عبر تقويم موارد مركز العمل. عند وجود تعارض، استثناء مورد مركز العمل يتجاوز استثناء تقويم الإنتاج.

### أنواع الاستثناءات

| النوع | مثال |
|---|---|
| Make Available | فنيون يعملون في عطلة لمعالجة تراكم. |
| Make Unavailable | فنيون في تدريب إلزامي. |
| Change Availability | تقليل الوحدات المتاحة في وردية. |
| Change Shift Time | تغيير بداية أو مدة الوردية. |

### قواعد

- الاستثناء خاص بمورد واحد أو أكثر في مركز عمل، وليس بالمنظمة كلها.
- لا تنشئ استثناءات لمورد متاح 24 ساعة إذا كانت سياسة النظام تتبع قاعدة Oracle المذكورة لاحقًا.
- يمكن تعديل الاستثناءات المستقبلية.
- يمكن حذف الاستثناءات المستقبلية.
- يمكن تعديل نهاية الاستثناء الحالي حسب الحاجة.

### جدول مقترح

| الحقل | النوع |
|---|---|
| id | UUID/Number |
| work_center_resource_id | FK |
| exception_type | Enum |
| start_datetime | Timestamp |
| end_datetime | Timestamp |
| availability_units | Decimal |
| reason | Text |
| status | Enum |
| created_by | FK |

---

## 15. العلاقات الرئيسية

```text
MaintenanceOrganization
 ├── WorkArea
 │    └── WorkCenter
 │         ├── WorkCenterResource
 │         │    ├── Resource
 │         │    ├── ShiftAllocation
 │         │    └── ResourceException
 │         └── WorkCenterCalendar
 └── Resource
      └── ResourceInstance
           ├── LaborResourceInstance
           └── EquipmentResourceInstance
```

### علاقات قاعدة البيانات

| من | إلى | النوع |
|---|---|---|
| maintenance_organizations | maintenance_work_areas | One-to-Many |
| maintenance_work_areas | maintenance_work_centers | One-to-Many |
| maintenance_work_centers | work_center_resources | One-to-Many |
| maintenance_resources | work_center_resources | One-to-Many |
| maintenance_resources | maintenance_resource_instances | One-to-Many |
| work_center_resources | work_center_resource_shifts | One-to-Many |
| work_center_resources | resource_calendar_exceptions | One-to-Many |

---

## 16. API مقترحة للفصل 2

| Method | Endpoint | الغرض |
|---|---|---|
| GET | `/maintenance-organizations` | قائمة المنظمات. |
| POST | `/maintenance-organizations` | إنشاء منظمة. |
| PATCH | `/maintenance-organizations/{id}` | تعديل منظمة. |
| POST | `/maintenance-organizations/{id}/activate` | تفعيل المنظمة بعد تحقق المتطلبات. |
| GET | `/work-areas` | قائمة مناطق العمل. |
| POST | `/work-areas` | إنشاء منطقة عمل. |
| PATCH | `/work-areas/{id}` | تعديل. |
| POST | `/work-areas/{id}/deactivate` | تعطيل. |
| GET | `/resources` | قائمة الموارد. |
| POST | `/resources` | إنشاء مورد. |
| PATCH | `/resources/{id}` | تعديل مورد. |
| POST | `/resource-instances` | إنشاء نسخة مورد. |
| GET | `/work-centers` | قائمة مراكز العمل. |
| POST | `/work-centers` | إنشاء مركز عمل. |
| PATCH | `/work-centers/{id}` | تعديل. |
| POST | `/work-centers/{id}/resources` | ربط مورد بمركز عمل. |
| POST | `/work-center-resources/{id}/shifts` | توزيع توفر المورد على الورديات. |
| POST | `/resource-calendar-exceptions` | إنشاء استثناء مورد. |

---

## 17. User Stories

### Organization Setup

- كمدير صيانة، أريد إنشاء منظمة صيانة وربطها بمنظمة مخزون حتى أبدأ إعداد الصيانة.
- كمدير صيانة، أريد معرفة إن كانت المنظمة جاهزة للتشغيل أم لا بناءً على وجود منطقة ومركز عمل.

### Work Areas

- كمدير صيانة، أريد إنشاء مناطق عمل داخل المنظمة حتى أقسم مواقع التنفيذ.
- كمدير صيانة، أريد تعطيل منطقة عمل دون حذف تاريخها.

### Resources

- كمدير صيانة، أريد إنشاء موارد من نوع Labor أو Equipment.
- كمدير صيانة، أريد منع تغيير Usage UOM بعد استخدام المورد في مركز عمل.

### Resource Instances

- كمدير صيانة، أريد ربط فني معين بمورد Labor.
- كمدير صيانة، أريد ربط معدة معينة أو أصل بمورد Equipment.

### Work Centers

- كمدير صيانة، أريد إنشاء مركز عمل داخل منطقة عمل.
- كمدير صيانة، أريد ربط موارد بمركز العمل وتحديد الكمية والتوفر.
- كمخطط صيانة، أريد أن تؤثر الكفاءة والاستفادة على مدة الجدولة.

---

## 18. Acceptance Criteria للفصل 2

- لا يمكن تفعيل منظمة صيانة بدون Work Area و Work Center.
- يمكن إنشاء Work Area بكود واسم فريدين.
- لا يمكن حذف Work Area فيها Work Centers نشطة.
- يمكن إنشاء Resource من نوع Labor أو Equipment.
- لا يمكن تغيير Usage UOM بعد ربط Resource بمركز عمل.
- لا يمكن حذف Resource مستخدم في مركز عمل أو له Instances نشطة.
- يمكن إنشاء Labor Resource Instance من شخص موجود أو يدويًا.
- Labor Resource Instance لا ترتبط بأكثر من Resource واحد.
- يمكن إنشاء Equipment Resource Instance من Asset أو يدويًا.
- يمكن إنشاء Work Center داخل Work Area نشطة.
- لا يمكن حذف Work Center مستخدم في Work Definition أو Work Order أو لديه موارد.
- يمكن ربط Resource بمركز عمل مع default units, 24h availability, utilization, efficiency.
- إذا كان المورد غير متاح 24h، يمكن توزيع وحداته حسب الورديات.
- يتم حساب Scheduled Duration بناءً على Required Usage / (Utilization × Efficiency).
- يمكن إنشاء استثناءات موارد تؤثر على توفر المورد في مركز العمل.



<!-- FILE: docs/03-assets-requirements.md -->

# الفصل 3 — Assets / الأصول

## 1. نطاق الفصل

هذا الفصل يعرّف وحدة الأصول داخل نظام الصيانة. الأصل هو كيان أو عنصر أو معدة أو شيء له قيمة تشغيلية أو مالية للمؤسسة أو للعميل. عند تعريف الأصل يصبح قابلًا للتتبع والإدارة والصيانة والإصلاح خلال دورة حياته.

يجب أن يدعم برنامجك نوعين رئيسيين من الأصول:

| النوع | الوصف |
|---|---|
| Enterprise Asset | أصل داخلي مملوك للمؤسسة، مثل آلة، مركبة، مضخة، خط إنتاج، رافعة، جهاز اختبار. |
| Customer Asset | أصل مملوك لعميل خارجي، وقد تتم صيانته من خلال الخدمة الميدانية أو إصلاح المستودع أو العقود. |

الفصل لا يتوقف عند شاشة إنشاء أصل فقط؛ بل يشرح البحث، الإنشاء اليدوي، الإنشاء التلقائي، التحرير، الصور، أجزاء الأصل، الهيكل الفيزيائي، الهيكل المنطقي، الاستيراد والتصدير، REST API، الربط بالأصول الثابتة، IoT، Service Logistics، B2B Service، وسجل تاريخ الأصل.

---

## 2. الصلاحيات والأدوار

### أدوار مرتبطة بالأصول

| الدور | الصلاحيات المقترحة في برنامجك |
|---|---|
| Maintenance Manager | إنشاء وتعديل أصول المؤسسة، عرض أصول العميل حسب الصلاحيات، إنشاء أوامر عمل للأصول، مراجعة التاريخ والتكلفة. |
| Maintenance Technician | عرض الأصول المرتبطة بأعماله، عرض الأجزاء والتاريخ والملاحظات، صلاحيات محدودة للتعديل. |
| Asset Administrator | إدارة أصول العملاء، الاستيراد، التصحيح، إعدادات البيانات، وربط الأصول بالتكاملات. |

### متطلبات أمنية

إذا أنشأت أدوارًا مخصصة بدل الأدوار الجاهزة، يجب أن يدعم النظام سياسة وصول إلى بيانات الأصول. في برنامجك ترجم ذلك إلى RBAC + Data Scope.

| العنصر | التطبيق المقترح |
|---|---|
| Data Resource | Installed Base Asset / Asset |
| Data Set | All Values أو Organization-scoped |
| Actions | Manage Asset, View Asset, Create Asset, Update Asset, Delete/End-date Asset |
| Post-sync Job | إعادة بناء فهارس الصلاحيات أو Cache الصلاحيات بعد تعديل الدور |

---

## 3. أنواع الأصول

### Enterprise Assets

أصول المؤسسة هي أصول داخلية. غالبًا يجب أن ترتبط بصنف Item وأن تكون قابلة للتتبع طوال دورة الحياة Full Lifecycle Tracked. تحتاج إلى Operating Organization لأنها المنظمة التي يعمل فيها الأصل وتُنشأ فيها أوامر العمل والصيانة الوقائية.

| الخاصية | قاعدة العمل |
|---|---|
| الملكية | داخلية للمؤسسة |
| Item | مطلوب |
| Tracking Method | Full Lifecycle Tracking |
| Customer | غير مطلوب |
| Operating Organization | مطلوب غالبًا |
| Work Orders | مسموحة إذا كان الأصل Full Lifecycle Tracked وAllow Work Orders مفعّل |
| Preventive Programs | مسموحة إذا كان Allow Maintenance Programs مفعّل والأصل يعمل في منظمة صيانة مناسبة |

### Customer Assets

أصول العملاء مملوكة لطرف خارجي. يمكن أن تستخدم Customer Asset Tracking فقط إذا كانت للتتبع دون أوامر عمل، أو Full Lifecycle Tracking إذا كانت ستدخل في صيانة عبر Maintenance أو Service Logistics أو Depot Repair.

| الخاصية | قاعدة العمل |
|---|---|
| الملكية | عميل خارجي |
| Customer | مطلوب |
| Item | مطلوب |
| Tracking Method | Customer Asset Tracking أو Full Lifecycle Tracking |
| Shipment Date | مطلوب لتعريف أصل العميل |
| Customer Purchase / Registration / Installed / In-Service Dates | تواريخ مرتبطة بالبيع والتسجيل والتركيب والتشغيل |
| Operating Organization | غير ظاهرة في Customer Asset Tracking، ومطلوبة عند Full Lifecycle Tracking إذا سيُصان الأصل بأوامر عمل |

---

## 4. المكونات التي يجب أن يديرها أصل واحد

| المكوّن | الوظيفة في برنامجك |
|---|---|
| Asset Data | بيانات تعريف الأصل: الرقم، الوصف، الصنف، السيريال، الكمية، الموقع، المنظمة، الإعدادات الافتراضية لأوامر العمل. |
| Parts List | قائمة القطع أو المواد التي تستخدم عادة لصيانة الأصل. |
| Meters | عدادات استخدام الأصل، ستفصل في فصل العدادات لاحقًا. |
| Physical Hierarchy | علاقة Parent/Child بين الأصول الفعلية. |
| Logical Hierarchy | تجميع منطقي للأصول عبر مواقع أو منظمات مختلفة. |
| Asset Route | مسار أصول لصيانة مجموعة أصول بأمر عمل واحد. |
| Images & Attachments | صور ومرفقات الأصل. |
| Notes | ملاحظات نصية عامة أو خاصة. |
| History | سجل كل تغييرات الأصل ومعاملاته. |
| Cost | تكاليف أوامر العمل المرتبطة بالأصل. |
| Fixed Assets Links | ربط الأصل التشغيلي بأصل ثابت مالي. |
| Service References | طلبات خدمة، عقود، اشتراكات، فرص، Leads، Work Orders ميدانية. |

---

## 5. شاشات إدارة الأصول

### 5.1 Manage Assets

شاشة تقليدية للبحث والإنشاء والتعديل. يجب أن تدعم:

| الوظيفة | التفاصيل |
|---|---|
| بحث بالكلمة | يبحث في Asset Number وDescription وItem. |
| بحث متقدم | Number, Description, Item, Serial, IoT Enabled, Include Child Assets, Operating Organization, Customer, Location Type, Location, Maintenance Enabled, Work Orders Allowed. |
| فلاتر إضافية | Country of Origin, Group, Include End Dated Assets, Location Organization, Lot, Sales Order, Work Center, Work Area, Competitor Asset, Project, Task, Contract. |
| Favorites | تمييز أصل كمفضل. |
| Export | تصدير نتائج البحث. |
| Saved Searches | حفظ فلاتر البحث وتعيين Default Search. |

### 5.2 Asset Information Management / Smart Search

شاشة بحث حديثة تستخدم Smart Search وFilter Chips. يجب أن تدعم:

| الميزة | التطبيق المقترح |
|---|---|
| Full-text Search | بحث واسع في عشرات الحقول. |
| Filter Chips | كل فلتر إضافي يضيّق النتائج بمنطق AND. |
| Multiple Terms | عدة كلمات داخل نفس الفلتر تعمل بمنطق OR. |
| Default Filters | Top-Level وActive افتراضيًا. |
| DFF Search | البحث داخل Descriptive Flexfields عند تفعيل Additional Information. |
| Sortable Table | جدول قابل للترتيب والتصفية. |
| Drawer | لوحة جانبية تعرض مجموعات الأصل وFlexfields. |
| Asset 360 | صفحة 360 تعرض المؤشرات والروابط للأصل والعلاقات. |
| Deep Links | فتح صفحة الأصل مباشرة من تقارير أو صفحات أخرى. |

### حقول Smart Search المقترحة

Asset Number, Description, Lot, Serial, Fixed Asset Number, Project, Task, Country of Origin, Operating Organization, Item, Group, Part, Customer, Bill Account, Sales Order, Selling Business Unit, Location Type, Subinventory, Customer Address, External Address, Internal Address, Location Organization, Work Center, Work Area, Descriptive Flexfields, Subscription Number.

---

## 6. إنشاء أصل

يدعم الفصل طريقتين يدويتين:

1. Create New Asset.
2. Copy Existing Asset.

ويدعم أيضًا إنشاء الأصول تلقائيًا من معاملات الأنظمة الأخرى.

### 6.1 الحقول الأساسية عند إنشاء أصل جديد

| الحقل | مطلوب | قواعد مهمة |
|---|---:|---|
| asset_number | لا | إذا لم يدخله المستخدم، يولد النظام رقمًا تلقائيًا. يجب أن يكون فريدًا. |
| description | لا | إذا ترك فارغًا يمكن أن يؤخذ من وصف الصنف. |
| operating_organization_id | حسب النوع | مطلوب غالبًا لأصل المؤسسة وFull Lifecycle customer asset. |
| item_required | نعم | افتراضيًا true. |
| item_id | حسب item_required | Enterprise asset يحتاج item full lifecycle tracked وserial controlled. |
| uom | حسب الحالة | مطلوب إذا لم يوجد item. |
| serial_number | لا | يجب أن يكون فريدًا داخل Operating Organization للأصول القابلة للصيانة. |
| lot_number | لا | اختياري. |
| quantity | نعم | إذا كان الصنف serialized فالكمية = 1 وغير قابلة للتعديل. |
| secondary_quantity | لا | حسب إعداد Dual UOM. |
| use_bom_for_initial_hierarchy | لا | ينشئ أصولًا فرعية من BOM كأصول منطقية placeholder. |
| enable_iot | لا | يستخدم لمزامنة Digital Twin مع IoT Asset Monitoring. |
| competitor_asset | لا | أصل منافس لا يتوقع صيانته. |
| customer_id | حسب النوع | مطلوب لأصل العميل. |
| location_type | نعم | Customer Address, External Address, Internal Address, Unknown, Work Center. |
| location_id | حسب location_type | إذا لم يحدد الموقع يتحول إلى Unknown في حالات معينة. |
| location_organization_id | عند Work Center | منظمة الموقع. |
| work_center_id | عند Work Center | مركز العمل المرتبط بالموقع. |
| default_wo_type | لا | Corrective أو Preventive. |
| default_wo_subtype | لا | Condition Based, Emergency, Planned, Reactive, Safety, Under Warranty. |
| shipment_date | لأصل العميل | تاريخ شحن الأصل للعميل. |

### 6.2 أزرار الحفظ

| الزر | السلوك |
|---|---|
| Save and Continue | إنشاء الأصل ثم فتح صفحة تحريره. |
| Save and Create Another | إنشاء الأصل وفتح نموذج جديد. |
| Save and Close | إنشاء الأصل وإغلاق النموذج. |

### 6.3 قواعد location_type = Unknown

يجب أن يتحول الموقع إلى Unknown إذا:

| الحالة | السبب |
|---|---|
| اختار المستخدم Customer/Internal/External Address ولم يحدد Location | لا يوجد موقع كامل. |
| اختار Work Center ولم يحدد Location Organization أو Work Center | بيانات موقع العمل ناقصة. |

### 6.4 Copy Existing Asset

عند نسخ أصل موجود:

| السلوك | المطلوب برمجيًا |
|---|---|
| اختيار أصل مصدر | جلب item وitem description تلقائيًا. |
| نسخ العدادات | إذا كان للأصل المصدر meters، يظهر خيار نسخها. |
| منع التكرار | عند الإنشاء، تحقق من default meters حتى لا تنشأ عدادات مكررة. |
| الحقول الجديدة | المستخدم يحدد Asset Number وDescription وموقع وبيانات أخرى للأصل الجديد. |

---

## 7. Use BOM for Initial Hierarchy

إذا كان item للأصل له Bill of Materials، يمكن استخدام BOM لإنشاء child assets تلقائيًا.

| القاعدة | التطبيق |
|---|---|
| إنشاء children | كل Child ينشأ في المستوى الأول أسفل الأصل. |
| نوع child | Logical Asset / Placeholder. |
| غير transactable | لا يستخدم كأصل كامل حتى يتم تفعيله. |
| تفعيل child | تحديث asset number, description, serial أو lot ثم حفظ. |
| حذف child منطقي | إذا لم يكن مطلوبًا يمكن حذفه من الهيكل. |

---

## 8. Split Non-Serialized Assets

الأصل غير المسلسل قد تكون كميته أكبر من 1. يجب أن يدعم برنامجك تقسيمه إلى أصول مستقلة.

### شروط السماح بالتقسيم

| الشرط | القاعدة |
|---|---|
| Asset Tracking | Full Lifecycle أو Customer Asset. |
| Structure Item Type | Standard. |
| Serial Generation | No Serial Control. |
| Lot Control | Full Lot Control أو Not Lot Control حسب الشروط. |
| Lot Divisible | Yes عند الحاجة. |
| Dual UOM | Fixed أو Default أو No Default. |
| Asset Quantity | أكبر من 1. |
| Primary UOM quantity | عدد صحيح وليس decimal. |
| Location Type | ليس In Inventory. |
| Customer Asset End Date | غير محدد. |
| Asset End Date | غير محدد. |
| Open Maintenance Work Order | غير مرتبط. |
| Reservation | غير محجوز لأمر عمل مفتوح. |
| Service Request | غير مرتبط بطلب خدمة مفتوح. |

### سلوك التقسيم

| السلوك | التطبيق |
|---|---|
| Split Quantity | إنشاء أصل جديد بكمية محددة. |
| Split All | إنشاء أصول جديدة بكمية 1 لكل أصل. |
| Preview List | عرض قائمة الأصول قبل الحفظ. |
| Cancel | لا ينشئ أي أصل. |
| Save and Close | ينشئ الأصول الجديدة فعليًا. |
| New Asset Number | رقم متسلسل من الأصل أو Prefix/Starting Number يحدده المستخدم. |
| Inherited Attributes | الأصول الجديدة ترث خصائص الأصل الأصلي. |
| Asset History | تسجيل عملية split في تاريخ الأصل. |

---

## 9. الإنشاء التلقائي للأصول

الأصل يمكن أن ينشأ تلقائيًا عندما يتم التعامل مع item متتبع كأصل في أنظمة أخرى.

### وضع الإنشاء

| الإعداد | السلوك |
|---|---|
| ORA_CSE_IB_INTERFACE_DEFERRED = Yes | إنشاء مؤجل. يحتاج Scheduled Job لمعالجة المعاملات المعلقة أو الأخطاء. |
| ORA_CSE_IB_INTERFACE_DEFERRED = No | إنشاء فوري بعد المعاملة. |

### مصادر الإنشاء التلقائي

| المصدر | القاعدة |
|---|---|
| Miscellaneous Receipt to Inventory | ينشئ أصلًا عند استلام صنف asset-tracked. |
| Purchase Receipt to Inventory Destination | ينشئ أصلًا في موقع Inventory. |
| Manufacturing Work Order Completion to Inventory | ينشئ أصلًا للمنتجات المكتملة من أوامر تصنيع standard/non-standard/transform. |
| Purchase Receipt to Work Order Destination | ينشئ أصلًا أثناء put away. |
| Purchase Receipt to Expense Destination | ينشئ أصلًا أثناء put away. |
| Sales Order Fulfillment | يحتاج item tracking = Full Lifecycle أو Customer Asset، وOrchestration step لإنشاء Installed Base Asset. |
| Service Request Asset Creation | ينشئ أصولًا منطقية من Pick-to-Order أو KIT/BOM components. |
| Manual Asset Creation with BOM | ينشئ child logical assets من item structure. |

---

## 10. عرض وتعديل الأصل

### 10.1 تبويبات Edit Asset

| التبويب | Enterprise Asset | Customer Asset | الوظيفة |
|---|---:|---:|---|
| Overview | نعم | نعم | بيانات الأصل، الصور، المرفقات، DFF/custom fields. |
| Parts List | نعم | نعم | قائمة المواد المستخدمة لصيانة الأصل. |
| Meters | نعم | نعم | عدادات الاستخدام. |
| Last Sales Order Details | لا | نعم | آخر عملية بيع وتفاصيل الرسوم. |
| Hierarchy | نعم | نعم | العلاقات الفيزيائية parent/child. |
| Contracts/Subscriptions | لا | نعم | عقود أو اشتراكات الأصل حسب profile option. |
| Service Requests | لا | نعم | طلبات الخدمة. |
| Work Orders | لا | نعم | أوامر العمل الميدانية. |
| Leads | لا | نعم | فرص أولية من المبيعات. |
| Opportunities | لا | نعم | فرص بيع مرتبطة بالأصل. |
| Asset Groups | نعم | نعم | مجموعات الأصل. |
| Notes | نعم | نعم | ملاحظات نصية. |
| History | نعم | نعم | تاريخ المعاملات والتغييرات. |
| Cost | نعم | نعم | تكاليف أوامر العمل. |
| Fixed Assets | نعم | نعم | الربط المالي بالأصول الثابتة. |

### 10.2 قواعد تعديل الحقول المهمة

| الحقل | قواعد التعديل |
|---|---|
| Asset Number | قابل للتعديل لكن يجب أن يبقى فريدًا. |
| Item | لا يعدّل إذا أنشئ الأصل تلقائيًا من Inventory/OM أو كان متكاملًا مع IoT/Subscriptions أو لديه Work Order. |
| Serial Number | فريد داخل Operating Organization للأصل القابل للصيانة. |
| Quantity | غير قابل للتعديل للأصل serialized، ويمكن تقسيمه لغير serialized. |
| Enable IoT | إذا فُعلت، تتم مزامنة الأصل مع IoT Asset Monitoring. |
| Operating Organization | يمكن نقل الأصل بين منظمات، لكن إذا كان في Inventory يجب نقل المخزون أولًا. |
| Location Type = Inventory | لا يمكن تعيينه من UI أو REST أو Import؛ يتطلب Inventory transaction. |
| Allow Maintenance Programs | يحدد إمكانية استخدام الأصل في برنامج صيانة وقائية. |
| Allow Work Orders | يحدد إمكانية إنشاء أمر عمل جديد للأصل. |
| Default WO Type/Subtype | يستخدمان لتعبئة أمر العمل افتراضيًا. |
| Attachments | ملف أو نص أو URL. |
| Country of Origin / Project / Task | تظهر من معاملات Inventory/Manufacturing ولا تعدل يدويًا. |

### 10.3 منطق Default Work Order Type/Subtype

| مصدر إنشاء أمر العمل | منطق التحديد |
|---|---|
| UI Manage Work Orders | يأخذ من الأصل أولًا، ثم إذا اختير Work Definition وفيه type/subtype فإنه يتغلب على قيمة الأصل. |
| REST API | Work Definition أولًا، ثم الأصل، ثم يجب إرسال type/subtype في payload وإلا يظهر خطأ. |
| Maintenance Program | يستخدم قيم الأصل، وإذا لم توجد يضع Planned / Preventive. |

---

## 11. الصور والمرفقات

يجب أن يدعم الأصل عدة صور. يمكن تحديد صورة Primary تظهر في صفحة الأصل والبحث والهيكل.

| الوظيفة | القاعدة |
|---|---|
| Upload Images | JPG/PNG وغيرها. |
| Multiple Images | يسمح بأكثر من صورة. |
| Primary Image | يجب تحديد صورة أساسية لعرضها. |
| Default from Item | إذا كان item له primary image، ترثه الأصول الجديدة تلقائيًا. |
| Download/Edit/Delete | إدارة الصور بعد الرفع. |
| High Resolution | يفضل حفظها كمرفق وعدم عرضها كصورة أساسية إذا كانت كبيرة. |

---

## 12. Parts List

قائمة أجزاء الأصل تساعد في تخطيط الصيانة وتحديد مواد بديلة أو متكررة.

| الوظيفة | القاعدة |
|---|---|
| Add Item | إضافة صنف إلى قائمة أجزاء الأصل. يجب ألا يكون نفس صنف الأصل. |
| Edit Quantity/UOM | تعديل الكمية ووحدة القياس. |
| Remove Item | حذف جزء من القائمة. |
| Copy from Existing Asset | نسخ قائمة أجزاء من أصل آخر، حتى لو كان inactive. |
| Duplicate Handling | تجاهل العناصر المكررة عند النسخ. |
| Organization Context | الأجزاء دائمًا مرتبطة بسياق منظمة. يفضل إضافتها على مستوى master organization إذا ستستخدم في work definitions/orders. |
| Maintenance Org Validation | item picker يجب أن يتحقق أن الصنف enabled في منظمة الصيانة المستخدمة. |

---

## 13. الهيكل الفيزيائي Physical Hierarchy

يمثل علاقة مكونات فعلية بين أصل رئيسي وأصول فرعية.

| العملية | التطبيق |
|---|---|
| Add Existing Child | إضافة أصل موجود كفرع. |
| Create New Child | إنشاء أصل جديد كفرع. |
| Remove Child | إزالة أصل فرعي من الهيكل. |
| Swap Child | استبدال أصل فرعي بأصل آخر. |
| Move Child | نقل أصل فرعي تحت أصل أب آخر داخل نفس الهيكل. |
| Edit Child Details | تعديل رقم الأصل والوصف والسيريال والـlot داخل الهيكل. |
| View Details | عرض تفاصيل أصل من الهيكل. |

قاعدة مهمة: عند إضافة أو نقل أصل داخل الهيكل الفيزيائي، يرث الأصل الفرعي موقع أعلى أصل أب في الهيكل. إذا تغير موقع الأصل الأعلى، تُحدّث مواقع الأبناء.

إذا تغيّرت Operating Organization للأصل الأب، يجب تشغيل عملية مزامنة لنشر التغيير إلى الأبناء داخل الهيكل.

---

## 14. نقل الأصل بين المنظمات

يمكن تحديث Operating Organization لأصل Enterprise أو Customer عندما ينتقل فعليًا أو تصبح منظمة صيانة أخرى مسؤولة عنه.

| القاعدة | التطبيق |
|---|---|
| أصل في Inventory | لا ينقل بتعديل operating organization مباشرة؛ يجب نقل المخزون أولًا. |
| Open Work Orders | لا تنتقل؛ تبقى في منظمتها ويجب تنفيذها هناك أو إلغاؤها. |
| Work Order History | Manage Work Orders منظمة-specific؛ استخدم Asset History أو تقارير cross-org. |
| Cost History | منظمة-specific؛ استخدم Cost tab أو analytics. |
| Meters | ليست organization-specific، لا تتأثر. |
| Maintenance Programs | غالبًا لا تنتقل، إلا إذا البرنامج يدعم assets across organizations. |
| Parent/Child Assets | يجب أن تكون في نفس المنظمة وتتحرك معًا. |

---

## 15. Logical Hierarchy وAsset Routes

الهيكل المنطقي يجمع أصولًا تعمل في نفس أو منظمات مختلفة. يمكن استخدامه لتمثيل مصنع، خط إنتاج، أسطول، عميل، موقع، أو Route.

### 15.1 حقول Logical Hierarchy

| الحقل | الوصف |
|---|---|
| name | اسم الهيكل؛ يمثل top-level node. |
| code | كود فريد. |
| description | وصف اختياري. |
| disabled | إذا true لا يمكن تعديل الهيكل ولا يستخدم كAsset Route. |
| asset_route | هل الهيكل Route. |
| work_order_asset_route_id | أصل قابل للصيانة يمثل النشاط أو الموقع المستخدم لإنشاء أوامر العمل. مطلوب إذا asset_route = true. |
| allow_skip | هل يسمح للفني/المشرف بتجاوز أصل في route. |
| reporting | Automatically أو Manually. |

### 15.2 Reporting في Asset Route

| الوضع | السلوك |
|---|---|
| Automatically | Reporting لكل أصل اختياري، والأصول Pending تكتمل تلقائيًا عند إكمال أمر العمل. |
| Manually | يجب تسجيل كل أصل كCompleted أو Skipped قبل إكمال أمر العمل. |

### 15.3 قواعد Association

| القاعدة | التطبيق |
|---|---|
| لا تكرر نفس الأصل | لا يضاف أصل إلى نفس logical hierarchy أكثر من مرة. |
| physical child | لا تضف أصلًا في موضع child داخل physical hierarchy؛ يسمح فقط بالأصل الأعلى في الهيكل الفيزيائي. |
| Route children | في Asset Route، الأصول الداخلة في التقرير يجب أن تكون في أول مستوى تحت اسم الهيكل. |
| Mix types | يمكن أن يحتوي الهيكل على Enterprise وCustomer assets حسب صلاحية المستخدم. |
| Create Work Order | من Hierarchy Navigator يمكن إنشاء أمر عمل للأصل المحدد. |

### 15.4 REST/Spreadsheet

يجب دعم:

| الوظيفة | Endpoint أو عملية |
|---|---|
| Create Logical Hierarchy | API لإنشاء اسم/كود الهيكل. |
| Create Relationship | ربط أصل بهيكل أو أصل بأصل داخل الهيكل. |
| Remove Relationship | إزالة أصل من الهيكل. |
| Update Position | ترتيب الأصول داخل الهيكل. |
| Spreadsheet Update | دعم تحديثات bulk عبر ملف/واجهة شبيهة بVisual Builder spreadsheet. |

---

## 16. Flexfields وApplication Composer

### 16.1 Flexfields

الأصل يدعم حقولًا إضافية:

| النوع | العدد |
|---|---:|
| Character | 30 |
| Number | 10 |
| Date | 5 |
| Date and Time | 5 |

يجب أن تظهر في منطقة Additional Information. يجب دعم Context Segment وحقول شرطية، ويمكن تحديثها من UI وREST وImport.

### 16.2 Application Composer

يدعم توسيع الصفحات:

| الصفحة | ما يمكن تخصيصه |
|---|---|
| Landing Page Layouts / Service Assets | أعمدة النتائج والفلاتر. لا تشمل Manage Assets التقليدية من Maintenance. |
| Creation Page Layouts | إظهار/إخفاء وترتيب الحقول وإضافة custom fields. |
| Details Page Layouts | تخصيص Overview tab وإضافة custom fields. |

### 16.3 User-defined Objects

| النوع | الاستخدام |
|---|---|
| User-defined Fields | حقول إضافية على الأصل، وتظهر تلقائيًا في REST API، لكنها قد لا تظهر في OTBI مباشرة. |
| User-defined Object غير مرتبط | كيان مستقل له صفحات خاصة. |
| User-defined Object مرتبط | كيان له علاقة مع Asset ويمكن إظهاره في تبويب جديد. |
| Child Object مرتبط | ينشأ دائمًا في سياق الأصل ولا يملك صفحة مستقلة. |

---

## 17. الاستيراد والتصدير

### 17.1 Import

استخدم File-Based Data Import لإنشاء وتحديث:

| الكيان | العمليات |
|---|---|
| Asset core attributes | create/update وتشمل DFF values. |
| Asset Parts List | create/update/delete. |
| Asset Charges | create/update/delete. |
| Asset Group Associations | create/update/delete. |

قاعدة مهمة: لا تنشئ أصولًا بموقع Inventory عبر import. هذا النوع من الموقع يأتي من Purchasing وInventory transactions مثل PO receipt أو miscellaneous receipt.

### 17.2 Purge Interface Data

إذا فشل الاستيراد أو حصل warning/error ولا يمكن إعادة معالجة البيانات، يجب دعم Scheduled Process أو Job لحذف بيانات interface batch بالكامل أو حسب import process.

### 17.3 Export/Mass Edit

| المصدر | الخيارات |
|---|---|
| Manage Assets | Include asset charges, Include child assets, Include part list components. |
| Asset Information Management | Export assets، Export asset meters، ويمكن تنفيذهما معًا. |

قاعدة مهمة: لا يتم تعديل ملف التصدير مباشرة ثم رفعه. يجب نسخ البيانات إلى أحدث import spreadsheet ثم تشغيل عملية import.

---

## 18. REST API المطلوب

### Installed Base Assets API

| العملية | الكيان |
|---|---|
| create/get/update | asset core attributes |
| create/get/update/delete | asset parts list |
| create/get/update/delete | asset charges |
| create/get/delete | asset relationships / hierarchy |
| create/get/update/delete | asset notes |
| get | asset meters |
| create/get/update/delete | DFF values |
| create/get/update/delete | Application Composer custom fields |

### APIs مساندة

| API | العمليات |
|---|---|
| Asset Group Rules / Groups | إدارة قواعد ومجموعات الأصول والارتباطات. |
| Meter Template API | تعريف قوالب العدادات وapplicability. |
| Meter Reading API | إنشاء وقراءة meter readings. |
| Asset Logical Hierarchies API | إنشاء logical hierarchies. |
| Asset Logical Hierarchy Relationships API | ربط وإزالة وترتيب الأصول داخل logical hierarchy. |
| Fixed Asset Relationship API | ربط installed base asset بfixed asset. |

---

## 19. الربط مع Fixed Assets

الربط مطلوب لأن تكاليف الصيانة قد تزيد قيمة الأصل المالي، فيجب ربط الأصل التشغيلي Installed Base Asset بأصل ثابت Fixed Asset.

| المطلب | القاعدة |
|---|---|
| العلاقة | أصل تشغيلي واحد يمكن أن يرتبط بأصل ثابت أو أكثر. |
| تاريخ صلاحية | كل علاقة لها valid date range. |
| منع التداخل | إذا انتهت علاقة، يمكن إضافة نفس الأصل الثابت مرة أخرى بدون تداخل تواريخ. |
| REST | يجب دعم إنشاء وتعديل العلاقة عبر API. |

### مزامنة الموقع

| الشرط | القاعدة |
|---|---|
| Serial-controlled IB Asset | مطلوب. |
| Fixed Asset quantity | يجب أن تكون 1. |
| Eligible to Sync | checkbox على علاقة الأصل الثابت. |
| Supported locations | Internal Address, Inventory, Transfer Orders, Subinventory Transfers. |
| Scheduled Process | تشغيل Connect and Synchronize Fixed Assets to Operational Assets. |

### Capitalization upon Purchase Receipt

يدعم الفصل حالتين:

| الحالة | النتيجة |
|---|---|
| Receipt Destination = Expense | إنشاء Installed Base Asset ورأسملته كFixed Asset تلقائيًا للشراء nonproject. |
| Receipt Destination = Inventory | إنشاء Installed Base Asset ورأسملته كFixed Asset عند الاستلام إلى المخزون، مع دعم business units/currencies متعددة. |

يجب حفظ مراجع العمليات المالية مثل PO، receipt، invoice، costing، accounting، mass additions، post mass additions.

### قواعد مالية مهمة

| القاعدة | التطبيق |
|---|---|
| nonrecoverable taxes | فقط الجزء غير القابل للاسترداد من الضرائب يدخل في رأسملة الأصل. |
| payment discounts | لا تنقل تلقائيًا إلى fixed assets؛ تحتاج معالجة يدوية. |
| invoice price variance | يمكن نقلها عند المحاسبة في AP. |
| freight/misc charges | تنقل إذا كانت prorated ومخصصة لتوزيع الصنف. |

### Termination Sync

| السيناريو | السلوك |
|---|---|
| End date Installed Base Asset | ثم retire للFixed Asset المرتبط. |
| Retire Fixed Asset | يمكن أن ينهي Installed Base Asset المرتبط تلقائيًا. |

الشرط: فقط serial-controlled installed base assets وfixed assets بكمية 1.

---

## 20. Party Merge

عند دمج بيانات العملاء والحسابات في أنظمة CRM/Financials يجب تحديث مراجع العميل على الأصول بحيث تشير إلى الطرف الناجي surviving party. في برنامجك ترجم ذلك إلى عملية customer merge handler تحدث:

| الكيان | ما يحدث |
|---|---|
| assets.customer_id | ينقل إلى surviving customer. |
| asset customer accounts/sites | تحدث إلى الحساب/الموقع الناجي. |
| asset history | يسجل transaction يوضح merge. |
| search index | يعاد بناؤه بعد الدمج. |

---

## 21. IoT Asset Monitoring

يجب دعم مزامنة الأصل مع IoT Asset Monitoring لإنشاء Digital Twin.

| القاعدة | التطبيق |
|---|---|
| Enable IoT | افتراضيًا selected عند إنشاء أصل جديد. |
| UI/REST creation/update | يطلق مزامنة. |
| FBDI creation/update | لا يزامن تلقائيًا؛ يحتاج import منفصل إلى IoT. |
| Digital Twin | Asset Monitoring يستدعي REST من الصيانة لجلب بيانات الأصل. |

### حقول تطلق المزامنة

Asset Number, Description, Serial Number, Operating Organization, Allow Maintenance Programs, New Work Orders/Allow Work Orders, Enable IoT, Asset End Date, Additional Attributes/Flexfields.

### أحداث meter تطلق المزامنة

إضافة meter، end-date meter، حذف meter قبل أول قراءة.

---

## 22. Component Returns وMaterial Transactions

الفصل يشرح تأثير معاملات المواد على الأصل والهيكل والتاريخ. في برنامجك تحتاج إلى نموذج واضح لمعاملات Issue/Return.

### أنواع الإرجاع المدعومة

| النوع | السلوك |
|---|---|
| Asset-tracked components from hierarchy | يمكن إرجاعها من الهيكل حتى مع demand معين. |
| Full lot component | إرجاع lot كامل ومزامنة كمية Manage Asset مع Inventory on-hand. |
| Full plain asset-tracked component | Plain = لا serial ولا lot. يستخدم Replace checkbox لتحديد الاستبدال. |
| Non-serialized non-asset tracked items | يمكن إرجاع كمية أكبر من واحد عبر To Transact أو إدخال مباشر. |
| Predefined serial components | إرجاع serials معرفة إلى inventory عندما تكون Defined and Not in Use. |

### شاشات الإرجاع

| الشاشة | الاستخدام |
|---|---|
| Material Transaction Page from Dispatch List | تنفيذ إرجاع من عملية أمر العمل. |
| Issue and Return Materials From Inventory | تنفيذ issue/return مباشرة من المخزون. |

### قواعد transaction history

| القاعدة | التطبيق |
|---|---|
| Miscellaneous receipt/issue من الخلفية | لا يغير material demand. |
| Include in Planning | يعتمد على وجود material demand؛ إذا لا يوجد demand يصبح unchecked. |
| Inventory on-hand | يتأثر بكل issue/return/misc transaction. |
| Material Issue/Return | يستخدم عندما تكون transaction مرتبطة بrequirement مناسب. |
| Misc Receipt/Issue | يستخدم عندما تكون transaction خارج الطلب الأصلي أو بدون demand. |

---

## 23. Service Logistics

يمكن استخدام الأصول في صيانة أصول العملاء في الموقع أو إرجاعها للإصلاح Depot Repair.

| المتطلب | القاعدة |
|---|---|
| Customer asset setup | يجب أن يكون مبنيًا على maintenance-enabled item وFull Lifecycle Tracked. |
| Operating organization | يجب أن يعمل الأصل في maintenance-enabled inventory organization. |
| Cost capture | تكاليف أوامر العمل تسجل في operating organization. |
| Field Service PM | Maintenance ينشئ PM work orders ثم Service Logistics تنشئ B2B SR/Service Work Orders. |
| Debrief | الفني ينفذ العمل ويرسل debrief؛ المسؤول يراجع charges وينشرها. |
| Depot Repair | إدارة إصلاح وإرجاع القطع عبر مواقع متعددة ومخازن ونقل داخلي. |

---

## 24. B2B Service

إذا فعّلت استخدام Installed Base Assets في B2B Service:

| القاعدة | التطبيق |
|---|---|
| Global Setting | اختيار عالمي: إما Installed Base Asset أو default asset object. لا تستخدم الاثنين معًا. |
| Page Layouts | إضافة حقول Installed Base Asset إلى service request وwork order layouts. |
| Downstream | تمرير installed base asset ID إلى Field Service أو Service Logistics. |
| Limitation | قد لا يدعم sales processes بنفس مستوى default asset object، ودعم extensibility محدود. |

---

## 25. Service Mapping

Service Mapping يربط مصادر مثل Sales Order Header/Lines بوجهة Installed Base Assets.

| العنصر | التطبيق |
|---|---|
| Source Entities | Sales Order Header, Sales Order Lines. |
| Destination Entity | Installed Base Assets. |
| Destination Attributes | Asset DFF أو Application Composer custom fields. |
| Required Privilege | Installed Base Administrator. |
| Sandbox | كل mapping يتم داخل sandbox قبل النشر. |
| Algorithms | Groovy scripts لتطبيق المنطق والتحويل. |
| Data Correction | Spreadsheet لتصحيح mapping errors ثم reprocess. |

### مهام Service Mapping

| المهمة | الوظيفة |
|---|---|
| Manage Service Mapping | إنشاء وإدارة العلاقات بين source/entity/attribute. |
| Manage Algorithms | كتابة المنطق الذي ينفذ mapping. |
| Manage Sales Order to Asset Data Correction in Spreadsheet | تصحيح أخطاء بيانات المبيعات قبل إنشاء/تحديث الأصل. |

---

## 26. Asset History وAudit

لا يستخدم الفصل Audit History العام لتعديل Asset object. بدل ذلك يسجل النظام تاريخ الأصل في جدول Asset History خاص.

| العنصر | التطبيق |
|---|---|
| History Table | asset_history أو CSE_ASSETS_HIST equivalent. |
| Standard Attributes | تسجيل أغلب التغييرات القياسية. |
| DFF/Custom Attributes | تسجيل الحقول الإضافية والحقول المخصصة. |
| Excluded Attributes | حقول لا يتوقع تعديلها خلال عمر الأصل أو لا تحتاج audit. |
| OTBI/Analytics | تقرير يعرض old/new values للحقول المهمة. |

### حقول سجل التاريخ

| الحقل | الوصف |
|---|---|
| reference | معرف المعاملة. |
| date | تاريخ المعاملة. |
| source | Asset Tracking, Inventory, Maintenance, Receiving, OM, Common Work Execution. |
| type | نوع المعاملة. |
| group | Asset Changes, Inventory/Sales, Work Orders/Inspections. |
| user | المستخدم الذي نفذ المعاملة. |
| old_values/new_values | تفاصيل التغييرات. |

---

## 27. نموذج قاعدة بيانات مقترح للفصل 3

| الجدول | الغرض |
|---|---|
| assets | السجل الرئيسي للأصل. |
| asset_locations | تاريخ ومعلومات مواقع الأصل. |
| asset_images | صور الأصل والصورة الأساسية. |
| asset_attachments | مرفقات ملفات/نص/روابط. |
| asset_parts_list | قائمة أجزاء الأصل. |
| asset_physical_hierarchy | علاقات parent/child الفيزيائية. |
| asset_logical_hierarchies | تعريف أسماء الهياكل المنطقية والRoutes. |
| asset_logical_hierarchy_nodes | علاقة الأصول داخل الهيكل المنطقي. |
| asset_notes | ملاحظات الأصل. |
| asset_history | سجل المعاملات والتغييرات. |
| asset_costs | تكاليف العمل على الأصل. |
| asset_fixed_asset_links | ربط الأصل التشغيلي بالأصل الثابت. |
| asset_import_batches | دفعات الاستيراد. |
| asset_export_jobs | طلبات التصدير. |
| asset_iot_sync_events | أحداث المزامنة مع IoT. |
| asset_service_mappings | خرائط بيانات Sales Order إلى Asset. |
| asset_material_transactions | معاملات issue/return المتعلقة بأصول وقطع. |
| asset_sales_order_details | آخر بيانات بيع لأصل عميل. |
| asset_external_refs | مراجع SR/Contracts/Subscriptions/Leads/Opportunities/Field Work Orders. |
| asset_flexfield_values | قيم DFF/Custom fields. |

---

## 28. واجهات API المقترحة للفصل 3

```text
GET    /assets
POST   /assets
GET    /assets/{id}
PATCH  /assets/{id}
POST   /assets/{id}/copy
POST   /assets/{id}/split
POST   /assets/{id}/end-date
POST   /assets/{id}/favorite
DELETE /assets/{id}/favorite

GET    /assets/{id}/parts-list
POST   /assets/{id}/parts-list
PATCH  /assets/{id}/parts-list/{lineId}
DELETE /assets/{id}/parts-list/{lineId}
POST   /assets/{id}/parts-list/copy-from

GET    /assets/{id}/hierarchy
POST   /assets/{id}/children
PATCH  /asset-hierarchy/{relationshipId}
DELETE /asset-hierarchy/{relationshipId}
POST   /asset-hierarchy/{relationshipId}/swap
POST   /asset-hierarchy/{relationshipId}/move

GET    /asset-logical-hierarchies
POST   /asset-logical-hierarchies
PATCH  /asset-logical-hierarchies/{id}
POST   /asset-logical-hierarchies/{id}/nodes
PATCH  /asset-logical-hierarchies/{id}/nodes/{nodeId}
DELETE /asset-logical-hierarchies/{id}/nodes/{nodeId}
POST   /asset-logical-hierarchies/{id}/create-work-order

GET    /assets/{id}/notes
POST   /assets/{id}/notes
PATCH  /assets/{id}/notes/{noteId}
DELETE /assets/{id}/notes/{noteId}

GET    /assets/{id}/history
GET    /assets/{id}/costs
GET    /assets/{id}/fixed-assets
POST   /assets/{id}/fixed-assets
PATCH  /assets/{id}/fixed-assets/{linkId}
POST   /assets/{id}/fixed-assets/sync-location

POST   /asset-imports
GET    /asset-imports/{batchId}
POST   /asset-imports/{batchId}/purge
POST   /asset-exports
GET    /asset-exports/{jobId}

POST   /assets/{id}/iot/sync
GET    /assets/{id}/service-refs
POST   /service-mappings
POST   /service-mappings/{id}/publish
POST   /service-mappings/{id}/reprocess-errors
```

---

## 29. قواعد تحقق Validation Rules

| القاعدة | الرسالة المقترحة |
|---|---|
| asset_number يجب أن يكون فريدًا | Asset number already exists. |
| enterprise asset يحتاج operating organization | Operating organization is required for enterprise assets. |
| customer asset يحتاج customer | Customer is required for customer asset. |
| serialized asset quantity = 1 | Serialized assets must have quantity equal to 1. |
| serial unique داخل organization | Serial number must be unique within the operating organization. |
| Full Lifecycle item لأوامر العمل | Work orders require a full lifecycle tracked item. |
| Inventory location لا يحدد يدويًا | Inventory location can only be set by inventory transactions. |
| split يحتاج quantity > 1 | Asset quantity must be greater than 1 to split. |
| لا split مع open work order | Asset can't be split because it has open work orders. |
| لا split مع reservation | Asset can't be split because it's reserved for an open work order. |
| لا split مع open service request | Asset can't be split because it has an open service request. |
| child inherits parent location | Child asset location must follow top parent location in physical hierarchy. |
| logical hierarchy لا يكرر أصل | Asset is already associated to this logical hierarchy. |
| asset route children في first level فقط | Asset route assets must be direct children of the hierarchy root. |
| fixed asset sync يحتاج serial + quantity one | Fixed asset synchronization requires serial-controlled asset and fixed asset quantity one. |
| FBDI لا يخلق Inventory location | Inventory-location assets must be created through inventory or purchasing transactions. |

---

## 30. User Stories مختصرة

| Epic | User Story |
|---|---|
| Asset Registry | كمدير صيانة أريد إنشاء أصل داخلي أو أصل عميل حتى أتابع صيانته طوال عمره. |
| Asset Search | كمستخدم أريد البحث بالرقم والسيريال والصنف والموقع والفلاتر الذكية حتى أصل للسجل بسرعة. |
| Asset 360 | كمدير أريد رؤية ملخص الأصل وعلاقاته وتكاليفه وتاريخه من صفحة واحدة. |
| Parts List | كمخطط صيانة أريد تعريف قطع الأصل حتى أعيد استخدامها في أوامر وتعريفات العمل. |
| Physical Hierarchy | كمدير أريد تمثيل الأصل وأجزائه حتى أعرف المكونات وترابطها. |
| Logical Hierarchy | كمدير أريد تجميع أصول عبر مواقع مختلفة حتى أدير route أو مجموعة تشغيلية. |
| Asset Route | كمدير أريد أمر عمل واحد لمجموعة أصول متكررة حتى أقلل تكرار أوامر العمل. |
| Import/Export | كمسؤول أصول أريد إنشاء وتحديث الأصول بكميات كبيرة. |
| Fixed Assets | كمسؤول مالي/صيانة أريد ربط الأصل التشغيلي بالأصل الثابت لتحديث القيمة والتكلفة. |
| IoT | كمدير أريد مزامنة الأصل مع Digital Twin لمراقبته بالحساسات. |
| Service Integration | كمسؤول خدمة أريد ربط أصول العملاء بطلبات الخدمة والعمل الميداني. |
| Audit | كمراجع أريد سجلًا بكل تغييرات الأصل وقيم old/new. |

---

## 31. ما لا نوسعه هنا لأنه سيأتي في فصول لاحقة

| الموضوع | السبب |
|---|---|
| Asset Groups | له فصل مستقل لاحق. |
| Meters | له فصل مستقل لاحق. |
| Supplier Warranty | له فصل مستقل لاحق. |
| Maintenance Work Orders | يذكر هنا كعلاقة فقط، وله فصل مستقل. |
| Work Execution | يذكر هنا في معاملات المواد، وله فصل مستقل. |

---

## 32. خلاصة الفصل كمتطلبات بناء

الفصل 3 يضيف إلى برنامجك وحدة أصول قوية. الحد الأدنى القابل للتنفيذ يجب أن يحتوي على سجل أصول يدعم Enterprise وCustomer assets، إنشاء وتعديل وبحث، مواقع، صور ومرفقات، قائمة أجزاء، هياكل فيزيائية ومنطقية، تاريخ تغييرات، تكلفة، استيراد وتصدير، REST API، وربط اختياري بالتكاملات: IoT وFixed Assets وService Logistics وB2B Service.

بعد تنفيذ هذا الفصل، يصبح النظام جاهزًا لفصل **Asset Groups** ثم **Meters for Assets**، لأن الأصول ستكون موجودة ويمكن تجميعها وقياس استخدامها.



<!-- FILE: docs/04-asset-groups-requirements.md -->

# الفصل 4 — Asset Groups / مجموعات الأصول

## 1. نطاق الفصل

هذا الفصل يضيف طبقة تصنيف فوق وحدة الأصول. الهدف هو أن يستطيع النظام تجميع الأصول حسب قواعد عمل واضحة بدل التعامل معها كقائمة منفصلة فقط. مثال عملي: مجموعة لكل الشاحنات من نفس الموديل في موقع معيّن، أو مجموعة لأصول عميل محدد، أو مجموعة أصول يجب استبعادها من العقود أو طلبات الخدمة.

التسلسل الصحيح في هذا الفصل هو:

```text
Asset Group Rule
        ↓
Asset Group
        ↓
Asset Group Assignment
        ↓
Assignment End Dating / Validation
```

أي أن المستخدم لا ينشئ مجموعة مباشرة من دون قاعدة. القاعدة تحدد خصائص التجميع، ثم تنشأ مجموعات تحت هذه القاعدة، ثم يتم إسناد الأصول المؤهلة إلى هذه المجموعات.

---

## 2. المفاهيم الأساسية

| المفهوم | المعنى البرمجي |
|---|---|
| Asset Group Rule | قاعدة تصف كيف تُنشأ المجموعات وما الخصائص التي يجب أن تلتزم بها الأصول داخلها. |
| Grouping Attributes | خصائص يجب أن تتطابق بين المجموعة والأصل، مثل Customer Number أو Location أو Model. |
| Asset Group | مجموعة فعلية تحت قاعدة محددة، لها رقم واسم وقيم للخصائص. |
| Asset Assignment | علاقة بين أصل ومجموعة، وقد تكون نشطة أو منتهية بتاريخ. |
| Unique Assignment | خيار يمنع الأصل من الانضمام لأكثر من مجموعة واحدة داخل نفس القاعدة. |
| Asset Validation Rule | قاعدة تُستخدم لاستبعاد أصول المجموعة من العقود أو طلبات الخدمة. |
| Inactive On | تاريخ إيقاف القاعدة أو المجموعة عن الاستخدام الجديد. |

---

## 3. طرق الإدارة المطلوبة

الفصل يوضح أن إدارة مجموعات الأصول يجب أن تكون ممكنة من أكثر من قناة:

| العملية | القنوات المطلوبة في برنامجك |
|---|---|
| إدارة قواعد مجموعات الأصول | واجهة المستخدم + REST API |
| إدارة مجموعات الأصول | واجهة المستخدم + REST API |
| إسناد الأصول إلى مجموعة | واجهة المستخدم + REST API + استيراد الأصول |

في برنامجك، الأفضل تنفيذ واجهات UI وAPI أولًا، ثم ترك الاستيراد كـ background job أو import adapter لاحق.

---

## 4. Asset Group Rules / قواعد مجموعات الأصول

قاعدة مجموعة الأصول هي الأصل الذي تُبنى عليه المجموعات. لا يمكن إنشاء مجموعة صحيحة إلا إذا كانت مرتبطة بقاعدة موجودة.

### 4.1 شاشة إدارة القواعد

يجب أن تدعم شاشة Manage Asset Group Rules:

| الوظيفة | الوصف |
|---|---|
| Search | البحث عن القواعد بالاسم أو الكود أو الحالة. |
| Create | إنشاء قاعدة جديدة. |
| Edit | تعديل قاعدة موجودة حسب القيود. |
| Delete | حذف قاعدة إذا لم تكن مستخدمة. |
| Inactivate | تحديد تاريخ تعطيل القاعدة. |
| Redwood Enabled Flag | إعداد اختياري لتفعيل واجهة حديثة مشابهة لـ Redwood. |

### 4.2 حقول إنشاء Asset Group Rule

| الحقل | مطلوب | الوصف |
|---|---:|---|
| name | نعم | اسم القاعدة. |
| code | نعم | كود فريد يعرّف القاعدة. |
| description | لا | وصف القاعدة. |
| grouping_attributes | لا | قائمة خصائص يجب أن تحترمها المجموعات والأصول. |
| usages | نعم/لا حسب التصميم | أين ستستخدم هذه المجموعة: الطلبات، الاشتراكات، أو حالة أصل العميل. |
| enforce_unique_assignment | لا | يمنع الأصل من الانضمام لأكثر من مجموعة واحدة تحت نفس القاعدة. |
| inactive_on | لا | بعد هذا التاريخ لا يمكن إنشاء مجموعات جديدة تحت القاعدة. |

### 4.3 Grouping Attributes

Grouping Attributes هي الخصائص المشتركة التي يجب أن تلتزم بها المجموعات والأصول.

مثال:

```text
Rule: Trucks By Customer
Grouping Attribute: Customer Number
Group: Customer 1006 Trucks
Allowed assets: only assets where customer_number = 1006
```

قواعد مهمة:

| القاعدة | التطبيق |
|---|---|
| يمكن اختيار أكثر من grouping attribute | مثل Customer + Location + Model. |
| عند إنشاء مجموعة تحت قاعدة لها attributes | يجب إدخال قيمة لكل attribute. |
| عند إسناد أصل لمجموعة | يجب أن يطابق الأصل قيم الـ attributes في المجموعة. |
| إذا لم تكن هناك grouping attributes | كل الأصول غير المسندة لهذه المجموعة تكون مؤهلة، مع مراعاة unique assignment. |

---

## 5. Usages / استخدامات القاعدة

الفصل يذكر استخدامات مختلفة لمجموعات الأصول.

| الاستخدام | المعنى في برنامجك |
|---|---|
| Order Entry | يمكن اختيار مجموعة أثناء إدخال سطر أمر بيع لمنتج asset-tracked، وبعد تنفيذ الطلب تنضم الأصول الناتجة للمجموعة تلقائيًا. |
| Subscriptions / Contracts | استخدام المجموعة في خطوط العقود أو الاشتراكات. |
| Customer Asset Status | استخدام المجموعة لتطبيق قواعد تحقق على أصول العملاء، مثل الاستبعاد من العقود أو طلبات الخدمة. |

### قاعدة خاصة بـ Customer Asset Status

عند اختيار استخدام Customer Asset Status:

| الشرط | القاعدة |
|---|---|
| لا يجتمع مع استخدامات أخرى | لا يمكن اختيار Customer Asset Status مع Order Entry أو Subscriptions. |
| Grouping Attributes | تكون معطلة، لأن أي أصل عميل يمكن أن ينضم للمجموعة. |
| Enforce Unique Assignment | يكون مفعلًا ولا يمكن إلغاؤه. |
| عدد القواعد | يسمح بقاعدة واحدة فقط بهذا الاستخدام. |
| الحذف | لا يمكن حذف القاعدة إذا كانت مرتبطة بمجموعة نشطة. |
| Default Group | يمكن تعيين مجموعة واحدة كافتراضية أثناء إنشاء أصل العميل أو شحنه. |

في برنامجك يمكن تمثيل Default Group بإعداد نظام:

```text
setting_key = DEFAULT_CUSTOMER_ASSET_VALIDATION_GROUP
value = asset_group_id
```

---

## 6. تعديل وحذف Asset Group Rules

### 6.1 التعديل

| الشيء | هل يمكن تعديله دائمًا؟ | الشرط |
|---|---:|---|
| name | نعم | لا يوجد شرط خاص. |
| code | نعم | يجب أن يبقى فريدًا. |
| description | نعم | لا يوجد شرط خاص. |
| grouping_attributes | لا | فقط إذا لم تُنشأ أي groups تحت القاعدة. |
| enforce_unique_assignment | لا | فقط إذا لم تُسند أصول إلى مجموعات تحت القاعدة. |
| usages | بحذر | لا تغير استخدامًا يغيّر منطق البيانات إذا كانت هناك groups أو assignments. |

### 6.2 الحذف

لا يمكن حذف قاعدة مجموعة أصول إذا كانت لديها مجموعات مرتبطة بها. الأفضل في برنامجك دعم التعطيل بدل الحذف في الأنظمة الإنتاجية.

---

## 7. Asset Groups / مجموعات الأصول

Asset Group هي المجموعة الفعلية التي ينضم إليها الأصل. كل مجموعة تتبع Rule واحدة فقط.

### 7.1 شاشة إدارة المجموعات

يجب أن تدعم شاشة Manage Asset Groups:

| الوظيفة | الوصف |
|---|---|
| Search | البحث بالرقم، الاسم، القاعدة، الحالة، attribute values. |
| Create | إنشاء مجموعة تحت قاعدة. |
| Edit | تعديل بيانات المجموعة حسب القيود. |
| Delete | حذف مجموعة إذا لم يكن لها أصول. |
| Assign Assets | فتح صفحة إسناد الأصول. |
| View Assignments | عرض الأصول المسندة وانتهاء الإسناد إن وجد. |

### 7.2 حقول إنشاء Asset Group

| الحقل | مطلوب | الوصف |
|---|---:|---|
| group_rule_id | نعم | القاعدة التي تنتمي لها المجموعة. |
| number | نعم | رقم فريد للمجموعة. يمكن توليده تلقائيًا، ويمكن أن يكون alphanumeric. |
| name | نعم | اسم المجموعة. يمكن توليده من الرقم ثم تعديله. |
| description | لا | وصف المجموعة. |
| grouping_attribute_values | حسب القاعدة | قيم الخصائص المطلوبة من القاعدة. |
| asset_validation_rules | لا | Exclude Asset from Contracts و/أو Exclude Asset from Service Requests. |
| inactive_on | لا | بعد هذا التاريخ لا يمكن إسناد أصول جديدة للمجموعة. |
| custom_fields | لا | حقول مخصصة عند دعم Application Composer أو custom field system. |

### 7.3 Asset Validation Rules

إذا كانت المجموعة مستخدمة للتحقق من حالة أصول العملاء، يجب أن تدعم اختيار واحدة أو كلا القاعدتين:

| القاعدة | الأثر المطلوب |
|---|---|
| Exclude Asset from Contracts | الأصل المنتمي لهذه المجموعة لا يظهر/لا يكون مؤهلًا عند إنشاء أو تعديل العقود. |
| Exclude Asset from Service Requests | الأصل المنتمي لهذه المجموعة لا يظهر/لا يكون مؤهلًا عند إنشاء طلب خدمة. |

---

## 8. تعديل وحذف Asset Groups

### 8.1 التعديل

| الشيء | هل يمكن تعديله؟ | الشرط |
|---|---:|---|
| name | نعم | يمكن دائمًا. |
| number/code | نعم | بشرط التفرد. |
| description | نعم | يمكن دائمًا. |
| grouping_attribute_values | لا دائمًا | فقط إذا لم تكن هناك أصول مسندة للمجموعة. |
| asset_validation_rules | لا دائمًا | فقط إذا لم تكن هناك أصول مسندة للمجموعة. |
| inactive_on | نعم | يؤثر على الإسنادات الجديدة فقط. |

### 8.2 الحذف

لا يمكن حذف مجموعة إذا كان لها أي أصل مسند. يمكن السماح بالحذف فقط عندما تكون المجموعة غير مستخدمة تمامًا. في غير ذلك استخدم `inactive_on` أو `status = INACTIVE`.

---

## 9. Asset Group Assignments / إسناد الأصول للمجموعات

الإسناد هو العلاقة بين أصل ومجموعة.

### 9.1 شاشة الإسناد

يجب أن تدعم صفحة Asset Group Assignments:

| الوظيفة | الوصف |
|---|---|
| View Assigned Assets | عرض الأصول المسندة للمجموعة. |
| Add Assets | فتح حوار بحث لإضافة أصول مؤهلة. |
| Remove Assignment | إلغاء إسناد أصل من المجموعة. |
| End Date View | عرض assignment_end_date إن انتهت العلاقة. |
| Warning Reason | عرض سبب انتهاء الإسناد عند المرور على أيقونة تحذير. |

### 9.2 قواعد اختيار الأصول المؤهلة

| حالة المجموعة | الأصول التي تظهر للمستخدم |
|---|---|
| المجموعة بلا grouping attributes | كل الأصول غير المسندة للمجموعة، مع مراعاة unique assignment. |
| المجموعة لها grouping attributes | فقط الأصول التي تطابق قيم attributes وغير المسندة للمجموعة. |
| قاعدة المجموعة enforce_unique_assignment = true | لا تظهر الأصول المسندة بالفعل إلى مجموعة أخرى تحت نفس القاعدة. |
| المجموعة inactive | لا يسمح بإسناد أصول جديدة. |
| القاعدة inactive | لا يسمح بإنشاء مجموعات جديدة، ويفضل أيضًا منع الإسنادات الجديدة حسب سياسة النظام. |

### 9.3 إلغاء الإسناد

إلغاء الإسناد يتم من Assigned Assets باستخدام Delete/Remove. في برنامجك الأفضل ألا تحذف السجل فعليًا في الأنظمة الإنتاجية، بل استخدم:

```text
assignment_end_date = today
end_reason = MANUAL_UNASSIGN
```

مع ترك hard delete للإعدادات غير المستخدمة أو بيئات الاختبار.

---

## 10. إدارة الإسناد من شاشة الأصل

الفصل يوضح أن المستخدم يمكنه التعامل مع المجموعات من صفحات الأصول أيضًا.

| الصفحة | المطلوب |
|---|---|
| Manage Assets | البحث عن الأصول باستخدام اسم مجموعة الأصل. |
| Edit Asset > Asset Groups tab | عرض كل المجموعات المرتبط بها الأصل. |
| Edit Asset > Asset Groups tab > Add | إسناد الأصل إلى مجموعة جديدة مع نفس قواعد الأهلية. |
| Edit Asset > Asset Groups tab > Remove | إلغاء إسناد الأصل من مجموعة. |

هذا يعني أن وحدة Asset Groups يجب أن تتكامل مع وحدة Assets من الفصل الثالث، ولا تكون شاشة مستقلة فقط.

---

## 11. تأثير تحديث الأصل أو End Date على الإسنادات

قد تنتهي علاقة الأصل بالمجموعة تلقائيًا دون أن يلغيها المستخدم يدويًا.

### 11.1 انتهاء الإسناد بسبب عدم مطابقة خصائص المجموعة

إذا تم تعديل الأصل بحيث لم يعد يطابق grouping attribute values الخاصة بالمجموعة، يجب أن ينهي النظام كل إسنادات الأصل التي لم تعد صالحة.

```text
asset.customer_number: 1006 → 2000
Group requires customer_number = 1006
Result: assignment_end_date = asset_update_date
end_reason = ASSET_NO_LONGER_MATCHES_GROUPING_ATTRIBUTES
```

### 11.2 انتهاء الإسناد بسبب End-Date للأصل

إذا تم end-date للأصل، يجب أن تنتهي إسناداته.

| الحالة | assignment_end_date |
|---|---|
| تحديث asset active end date فقط | asset active end date |
| تحديث customer asset end date فقط | customer asset end date |
| تحديث الاثنين معًا | customer asset end date |

يجب عرض أيقونة تحذير أو حالة Ended مع سبب الانتهاء في صفحة الإسناد.

---

## 12. Application Composer / الحقول المخصصة

الفصل يوضح إمكانية توسيع Asset Group object بإضافة حقول مخصصة تظهر في صفحات Create وEdit وتظهر أيضًا في REST API.

### 12.1 ما يمكن تخصيصه

| العنصر | الدعم المطلوب |
|---|---|
| Asset Group custom fields | تعريف حقول مخصصة. |
| Create Asset Group page | إظهار/إخفاء حقول وإضافة حقول مخصصة. |
| Edit Asset Group page | إظهار/إخفاء حقول وإضافة حقول مخصصة. |
| Functional/data security | صلاحيات على الحقول أو الكائنات المخصصة. |
| Scripts | دعم قواعد أو scripts مثل Groovy أو بديل داخلي. |
| Child custom objects | يمكن إنشاؤها وتظهر عبر REST API، لكنها لا تظهر في صفحات Create/Edit الأساسية. |

### 12.2 قيود مهمة

| القيد | المعنى في برنامجك |
|---|---|
| لا يمكن تمديد Manage Asset Groups search page | لا تجعل custom fields تظهر تلقائيًا في شاشة البحث إلا إذا بنيت ذلك صراحة. |
| الحقول المخصصة تظهر في REST API | API يجب أن يقبل/يعيد custom_fields. |
| أضف الحقول إلى Create وEdit معًا | لتناسق تجربة المستخدم. |
| التغيير يتم داخل Sandbox ثم Publish | استخدم draft/published configuration. |
| صلاحية Custom Objects Administration | مستخدمو التخصيص يحتاجون دورًا إداريًا خاصًا. |
| Application Implementation Consultant | الدور المطلوب لمن يدير Application Composer. |

### 12.3 Workflow مقترح للتخصيص

```text
Create Sandbox
        ↓
Open Application Composer
        ↓
Select ERP/SCM Application
        ↓
Open Asset Group object
        ↓
Define custom fields / manage pages / scripts
        ↓
Duplicate Create/Edit page before editing
        ↓
Preview changes
        ↓
Publish sandbox
        ↓
Users see updated fields and REST API exposes them
```

في مشروعك الحالي، إذا لم تكن ستبني Application Composer كامل، يكفي تنفيذ بنية `custom_fields JSONB` مع جدول لتعريف الحقول.

---

## 13. REST API المقترحة

| API | الوظيفة |
|---|---|
| GET /asset-group-rules | البحث عن قواعد المجموعات. |
| POST /asset-group-rules | إنشاء قاعدة. |
| GET /asset-group-rules/{id} | عرض قاعدة. |
| PATCH /asset-group-rules/{id} | تعديل قاعدة. |
| DELETE /asset-group-rules/{id} | حذف قاعدة غير مستخدمة. |
| GET /asset-groups | البحث عن مجموعات. |
| POST /asset-groups | إنشاء مجموعة. |
| GET /asset-groups/{id} | عرض مجموعة. |
| PATCH /asset-groups/{id} | تعديل مجموعة. |
| DELETE /asset-groups/{id} | حذف مجموعة غير مستخدمة. |
| GET /asset-groups/{id}/assignments | عرض أصول المجموعة. |
| GET /asset-groups/{id}/eligible-assets | عرض الأصول المؤهلة للإسناد. |
| POST /asset-groups/{id}/assignments | إسناد أصل أو عدة أصول. |
| DELETE /asset-groups/{id}/assignments/{assignmentId} | إلغاء الإسناد. |
| GET /assets/{id}/groups | عرض مجموعات أصل معين. |
| POST /assets/{id}/groups | إسناد أصل لمجموعة من صفحة الأصل. |
| DELETE /assets/{id}/groups/{assignmentId} | إلغاء إسناد من صفحة الأصل. |

---

## 14. نموذج قاعدة البيانات المقترح

```text
asset_group_rules
asset_group_rule_attributes
asset_group_rule_usages
asset_groups
asset_group_assignments
asset_group_assignment_audit
asset_group_default_profiles
asset_group_custom_field_definitions
asset_group_custom_field_values
```

### 14.1 asset_group_rules

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| name | string |
| code | string unique |
| description | text |
| enforce_unique_assignment | boolean |
| inactive_on | date nullable |
| status | ACTIVE / INACTIVE |
| custom_fields | json |

### 14.2 asset_group_rule_attributes

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| rule_id | FK |
| attribute_code | string |
| attribute_label | string |
| value_type | string / number / date / boolean |
| sequence_number | int |

### 14.3 asset_group_rule_usages

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| rule_id | FK |
| usage_code | ORDER_ENTRY / SUBSCRIPTION / CUSTOMER_ASSET_STATUS |

### 14.4 asset_groups

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| rule_id | FK |
| group_number | string unique |
| name | string |
| description | text |
| grouping_values | json |
| asset_validation_rules | json / string array |
| inactive_on | date nullable |
| custom_fields | json |
| status | ACTIVE / INACTIVE |

### 14.5 asset_group_assignments

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| asset_group_id | FK |
| asset_id | FK |
| assignment_start_date | date |
| assignment_end_date | date nullable |
| end_reason | enum nullable |
| end_detail | text nullable |
| source | MANUAL / REST_API / ASSET_IMPORT / ORDER_FULFILLMENT / SYSTEM |
| created_by | user id |

---

## 15. قواعد التحقق Validation Rules

| القاعدة | الرسالة المقترحة |
|---|---|
| لا يمكن إنشاء Group دون Rule | Asset group rule is required. |
| code للقاعدة فريد | Asset group rule code already exists. |
| group_number فريد | Asset group number already exists. |
| لا يمكن إنشاء group داخل rule inactive | Cannot create groups for an inactive rule. |
| لا يمكن إسناد أصل إلى group inactive | Cannot assign assets to an inactive group. |
| يجب إدخال قيمة لكل grouping attribute | Missing grouping attribute value. |
| الأصل يجب أن يطابق قيم grouping attributes | Asset does not match group attribute values. |
| لا يمكن تعديل grouping attributes إذا كانت هناك groups | Grouping attributes cannot be changed after groups are created. |
| لا يمكن تعديل enforce_unique_assignment إذا وُجدت assignments | Unique assignment setting cannot be changed after assets are assigned. |
| لا يمكن حذف rule لديه groups | Asset group rule has groups. |
| لا يمكن حذف group لديه assets | Asset group has assigned assets. |
| Customer Asset Status لا يجتمع مع usages أخرى | Customer asset status usage cannot be combined with other usages. |
| عند Customer Asset Status يجب تفعيل unique assignment | Unique assignment is required for customer asset status usage. |
| يسمح بقاعدة واحدة فقط لـ Customer Asset Status | Only one customer asset status rule is allowed. |
| لا يمكن حذف customer asset status rule المرتبطة بمجموعة نشطة | Cannot delete rule associated with an active group. |

---

## 16. الصلاحيات المقترحة

| الوظيفة | Maintenance Manager | Maintenance Technician | Asset Administrator | System Admin |
|---|---:|---:|---:|---:|
| عرض Asset Groups | نعم | نعم | نعم | نعم |
| إنشاء Asset Group Rule | نعم | لا | نعم | نعم |
| تعديل Asset Group Rule | نعم | لا | نعم | نعم |
| حذف Asset Group Rule | محدود | لا | نعم | نعم |
| إنشاء Asset Group | نعم | لا | نعم | نعم |
| تعديل Asset Group | نعم | لا | نعم | نعم |
| إسناد أصول للمجموعة | نعم | محدود/لا | نعم | نعم |
| إلغاء الإسناد | نعم | محدود/لا | نعم | نعم |
| تعديل custom fields | لا | لا | لا | نعم |
| نشر sandbox/configuration | لا | لا | لا | نعم |

---

## 17. تكامل الفصل 4 مع الفصول السابقة

| الفصل السابق | نقطة التكامل |
|---|---|
| الفصل 1 Overview | Asset Groups تظهر في Task Navigator ضمن Asset and Work Definition، وتدخل ضمن REST/import. |
| الفصل 2 Maintenance Organization | قد تستخدم الأصول المصنفة حسب المنظمة أو الموقع أو مركز العمل كـ grouping attributes. |
| الفصل 3 Assets | الأصل يحتوي Asset Groups tab، والبحث الذكي يبحث باسم أو رقم المجموعة، والاستيراد يمكنه إنشاء/تعديل ارتباط الأصل بالمجموعة. |

---

## 18. Backlog تنفيذي للفصل 4

| الأولوية | المهمة |
|---|---|
| P0 | إنشاء جداول asset_group_rules وasset_groups وasset_group_assignments. |
| P0 | بناء CRUD لقواعد المجموعات. |
| P0 | بناء CRUD للمجموعات. |
| P0 | منع إنشاء مجموعة قبل اختيار Rule. |
| P0 | تنفيذ matching بين الأصل وgrouping attributes. |
| P0 | تنفيذ unique assignment داخل rule. |
| P1 | شاشة Assign Assets مع eligible assets endpoint. |
| P1 | تبويب Asset Groups داخل صفحة الأصل. |
| P1 | البحث عن الأصول باسم/رقم المجموعة. |
| P1 | auto end-date assignments عند تحديث الأصل أو end-date الأصل. |
| P2 | asset validation rules للاستبعاد من العقود وطلبات الخدمة. |
| P2 | custom_fields للـ Asset Group وREST exposure. |
| P2 | import adapter لإسناد أصول للمجموعات. |
| P3 | sandbox/configuration workflow شبيه Application Composer. |
| P3 | analytics dimensions: Asset Group, Assignment, Rule. |

---

## 19. الخلاصة التنفيذية

الفصل الرابع يبني نظام تصنيف للأصول فوق وحدة Assets. أهم شيء في التنفيذ هو احترام الترتيب: Rule ثم Group ثم Assignment. القاعدة تحدد القيود، المجموعة تخزن قيم القيود، والإسناد يربط الأصل بالمجموعة بعد التحقق من المطابقة. يجب أن يكون النظام قادرًا على إنهاء الإسناد تلقائيًا إذا تغيرت بيانات الأصل أو انتهت صلاحية الأصل، ويجب أن ي expose بيانات المجموعات في REST API والاستيراد وشاشة الأصل والبحث.



<!-- FILE: docs/05-meters-for-assets-requirements.md -->

# الفصل 5 — Meters for Assets / عدادات الأصول

## 1. نطاق الفصل

هذا الفصل يضيف إلى نظام الصيانة وحدة **عدادات الأصول Asset Meters**. الهدف منها تتبع استخدام الأصل أو حالته بمرور الوقت، مثل ساعات التشغيل، عدد الدورات، المسافة، الحرارة، الضغط، أو أي قراءة قادمة من عداد فعلي أو نظام تحكم أو حساس IoT.

العدادات لا تُستخدم فقط للتسجيل التاريخي؛ بل تُستخدم أيضًا لتوقع الصيانة الوقائية عندما تكون القراءة **تصاعدية Ascending**. في هذه الحالة يعتمد النظام على قيمة **Life-to-Date** مع فاصل صيانة Meter Interval لإعادة حساب تواريخ الاستحقاق المستقبلية كلما دخلت قراءة جديدة.

```text
Meter Template
      ↓
Asset Meter Association
      ↓
Meter Reading History
      ↓
Net Change / Displayed Reading / Life-to-Date Reading
      ↓
Preventive Maintenance Forecast / Work Order Completion / IoT Sensor Updates
```

---

## 2. المفاهيم الأساسية

| المفهوم | المعنى البرمجي |
|---|---|
| Meter Template | قالب عداد reusable يحدد نوع العداد، نوع القراءة، الاتجاه، قواعد التحقق، reset، rollover، والتوقعات. |
| Asset Meter | ربط قالب عداد بأصل محدد. هذا الربط له تاريخ قراءات مستقل عن أي أصل آخر. |
| Meter Reading | قراءة مسجلة لعداد أصل في تاريخ ووقت محددين. |
| Continuous Meter | عداد قراءاته متسلسلة، وكل قراءة مرتبطة بما قبلها وما بعدها، مثل عداد ساعات أو عداد مسافة. |
| Gauge Meter | عداد قراءاته مستقلة، مثل الحرارة أو الضغط؛ القراءة الحالية لا تعتمد حسابيًا على السابقة. |
| Absolute Reading | القيمة الظاهرة على العداد الفعلي وقت التسجيل. |
| Change Reading | مقدار التغير منذ آخر قراءة. |
| Reading Direction | اتجاه القراءة: Ascending أو Descending، أما Gauge فيعامل كـ Bidirectional. |
| Net Change | الفرق أو التغير المحسوب بين القراءة الحالية والسابقة. |
| Displayed Reading | القيمة المعروضة على العداد الفعلي بعد احتساب reset أو rollover. |
| Life-to-Date Reading | القيمة التراكمية مدى الحياة، ولا تعود إلى الصفر عند reset أو rollover. |
| Reset Event | إعادة العداد إلى قيمة محددة، غالبًا 0 أو 1. |
| Rollover Event | وصول العداد إلى أقصى قيمة ثم عودته إلى قيمة بداية، غالبًا صفر. |
| Locked Reading | قراءة مقفلة بواسطة حلول أخرى مثل Subscription Management، ولا يسمح بتعديل ما قبلها. |

---

## 3. الوظائف الرئيسية في وحدة العدادات

الفصل يوضح أن النظام يجب أن يدعم دورة إدارة كاملة للعدادات:

| الوظيفة | الوصف |
|---|---|
| تعريف Meter Template | إنشاء قالب عداد قابل لإعادة الاستخدام. |
| ربط Meter Template بأصل | إنشاء Asset Meter فريد لكل أصل. |
| عرض تفاصيل عداد الأصل | عرض الإعدادات والقراءات والحالة. |
| حذف عداد أصل | فقط إذا لم توجد قراءات بعد القراءة الأولية. |
| إدخال قراءات جديدة | من صفحة الأصل، أو عند إكمال أمر العمل، أو REST، أو FBDI. |
| عرض تاريخ القراءات | قراءة القيم المحسوبة والحالة والمرجع. |
| إدخال قراءة تاريخية out-of-sequence | فقط من صفحة Enter Readings، وليس REST أو import. |
| تعديل أو تعطيل قراءة تاريخية | حسب قيود latest/locked/reset. |
| تحديث إعدادات Asset Meter | إعدادات التوقعات، الإلزام عند إكمال العمل، ومعدل الاستخدام. |
| Mass Association | ربط القوالب جماعيًا بالأصول المطابقة للأصناف. |
| Auto Association | ربط تلقائي أثناء إنشاء الأصل بناءً على item applicability. |
| IoT Meter Readings | إنشاء قراءات تلقائيًا من sensor data. |
| Import/Export | إنشاء أو تحديث قراءات العدادات جماعيًا. |

---

## 4. شاشة Manage Meter Templates

يجب أن تكون هناك شاشة لإدارة قوالب العدادات يمكن الوصول إليها من قسم Asset and Work Definition.

### 4.1 البحث عن القوالب

الشاشة تحتوي على:

| عنصر الواجهة | المطلوب |
|---|---|
| Search Bar | البحث بالكود، الاسم، الوصف، UOM، Meter Type، Reading Type، Reading Direction. |
| Results Table | عرض القوالب مرتبة أبجديًا عند فتح الصفحة. |
| Create Template Button | فتح معالج إنشاء قالب جديد. |
| Hyperlinked Name | فتح قالب موجود للتعديل. |
| Asset Meters Indicator | علامة توضح أن القالب مرتبط بعداد أصل واحد أو أكثر. |

### 4.2 أعمدة النتائج

| الحقل | الوصف |
|---|---|
| Meter Name | اسم القالب. |
| Meter Code | كود القالب ويجب أن يكون فريدًا. |
| Meter Description | وصف القالب. |
| Unit of Measure | وحدة قياس القراءة، مثل Hour أو KM أو Cycle أو Celsius. |
| Meter Type | Continuous أو Gauge. |
| Reading Type | Absolute أو Change. |
| Reading Direction | Ascending أو Descending، وGauge يعامل كـ Bidirectional. |
| Status | حالة القالب. |
| Start Date | تاريخ بدء صلاحية القالب. |
| End Date | تاريخ انتهاء صلاحية القالب. |
| Asset Meters | هل يوجد Asset Meter مرتبط بالقالب. |

---

## 5. إنشاء Meter Template

الفصل يعرض إنشاء القالب كعملية بثلاث مراحل:

```text
Define Template Essentials
        ↓
Set Template Options
        ↓
Add Applicable Items
```

### 5.1 Define Template Essentials

| الحقل | مطلوب | القاعدة |
|---|---:|---|
| meter_name | نعم | اسم القالب. |
| meter_code | نعم | كود فريد. |
| description | لا | وصف اختياري. |
| uom_id | نعم | وحدة القياس. |
| meter_type | نعم | Continuous أو Gauge. |
| reading_type | نعم | Absolute أو Change. |
| reading_direction | نعم | Ascending أو Descending، وGauge يكون Bidirectional. |
| start_date | نعم | بداية الفعالية. |
| end_date | لا | نهاية الفعالية. |
| reading_min_value | لا | فقط لبعض الأنواع، للتحقق عند إدخال القراءة. |
| reading_max_value | لا | فقط لبعض الأنواع، للتحقق عند إدخال القراءة. |
| initial_value | لا | يصبح أول قراءة تاريخية عند ربط العداد بالأصل. |
| record_at_work_order_completion | نعم | Do not allow أو Mandatory في القالب، وفي مستوى Asset Meter يمكن أن تشمل Optional. |
| reset_allowed | لا | فقط للعدادات Ascending من نوع Absolute أو Change. |
| reset_value | حسب reset | غالبًا 0 أو 1. |
| rollover_allowed | لا | فقط Continuous + Absolute + Ascending. |
| rollover_max_value | حسب rollover | أعلى قيمة قبل rollover. |
| rollover_min_value | حسب rollover | أقل قيمة بعد rollover، وإذا وجد reset value يجب أن تساويه. |
| allow_schedule_maintenance | لا | لا يطبق على Gauge. يوصى فقط مع Ascending. |
| estimated_daily_utilization_rate | حسب forecast | مطلوب إذا سمح العداد بجدولة برنامج صيانة. |
| readings_for_utilization_rate | لا | عدد القراءات المستخدمة لحساب معدل الاستخدام تلقائيًا. |

### 5.2 قواعد Reading Minimum / Maximum

| نوع العداد | هل يسمح Min/Max؟ | ملاحظات |
|---|---:|---|
| Continuous + Change | نعم | قيمة Change يجب أن تكون أكبر أو تساوي صفرًا، ويمكن ضبط نطاق مثل 0 إلى 24 ساعة. |
| Gauge | نعم | يمكن أن تكون القيم موجبة أو سالبة، مثل نطاق حرارة. |
| Continuous + Absolute | غالبًا لا | يستخدم منطق الاتجاه والـ reset/rollover بدل min/max العادي. |

### 5.3 Record Meters at Work Order Completion

هذا الخيار يتحكم في إدخال القراءة عند إكمال أمر العمل:

| القيمة | المعنى |
|---|---|
| Do not allow | لا يطلب النظام قراءة عند إكمال أمر العمل. |
| Optional | مسموح في مستوى Asset Meter، قراءة اختيارية عند الإكمال. |
| Mandatory | يجب إدخال قراءة لكل العدادات المطلوبة عند إكمال العمل. |

عند جعل القراءة Mandatory في إكمال أمر العمل، لا يستطيع المستخدم تسجيل بعض العدادات وترك بعضها؛ يجب إدخال قراءات كل العدادات المطلوبة.

### 5.4 Reset و Rollover

| الحدث | متى يستخدم؟ | أثره |
|---|---|---|
| Reset | عندما توجد حاجة عمل لإعادة العداد إلى قيمة محددة بعد صيانة أو دورة عمل. | Displayed Reading يعود إلى reset value، لكن Life-to-Date يستمر تراكمه. |
| Rollover | عندما يصل العداد الفيزيائي إلى أقصى قيمة ثم يعود للصفر أو قيمة بداية. | يسمح بتسجيل قراءة تبدو أقل من السابقة مع الحفاظ على Life-to-Date. |

> قاعدة تصميم مهمة: التوقعات الوقائية تعتمد على Life-to-Date؛ لذلك reset يعطي مؤشرًا بصريًا وتشغيليًا، لكنه لا يعيد سجل الاستخدام التراكمي للصفر.

### 5.5 Add Applicable Items

Item Applicability اختياري، ويستخدم فقط إذا أردت أن يرتبط القالب تلقائيًا بالأصول الجديدة عند إنشاء الأصل.

| الحقل | الوصف |
|---|---|
| master_organization_id | المنظمة الرئيسية للصنف. |
| item_id | الصنف الذي ينطبق عليه القالب. |
| item_number | رقم الصنف. |
| item_description | وصف الصنف. |
| start_date | بداية فعالية الانطباق. |
| end_date | نهاية الانطباق. |
| status | Active / Inactive. |

---

## 6. أنواع القوالب والنمذجة العملية

| المثال | الإعداد المقترح | الاستخدام |
|---|---|---|
| Hour Meter – Displayed Value | Continuous > Absolute > Ascending | عداد ساعات تشغيل، يصلح للصيانة كل 100 ساعة مثلًا. |
| Hour Meter – Incremental Value | Continuous > Change > Ascending | تسجيل ساعات تشغيل مقطعية، مثل رحلات أو دورات منفصلة. |
| Odometer – Displayed Value | Continuous > Absolute > Ascending | عداد مسافة، مع احتمال rollover عند الوصول لأقصى رقم. |
| Trip Odometer | Continuous > Absolute > Ascending + Reset | تسجيل مسافة رحلة ثم reset بين الرحلات. |
| Manufacturing Input – Descending | Continuous > Absolute > Descending | تتبع قيمة تتناقص مثل مادة تكفي لعدد محدد من الدورات. لا يوصى بها للتوقع الوقائي. |
| Temperature Probe | Gauge > Absolute > Bidirectional | مراقبة حرارة أو ضغط أو قيمة مستقلة، وقد تستخدم للتحليل أو تنبيه IoT. |

قاعدة مهمة للفصول اللاحقة: استخدم العدادات **Ascending** فقط لبرامج الصيانة الوقائية، لأن forecast قد لا يحسب التواريخ بشكل صحيح مع الاتجاهات الأخرى.

---

## 7. إنشاء Meter لأصل محدد

إنشاء عداد لأصل هو عملية من خطوتين:

```text
1. Create or reuse Meter Template
2. Associate template to asset
```

يمكن لقالب واحد أن يرتبط بعدة أصول، ويمكن للأصل الواحد أن يحتوي على عدة عدادات. لكن كل علاقة بين أصل وقالب يجب أن تكون فريدة، ويكون لها تاريخ قراءات مستقل.

### 7.1 Assign Meter Template to Asset

عند إضافة قالب إلى أصل:

| القاعدة | التطبيق |
|---|---|
| لا تعرض القوالب inactive | حتى لا ينشأ عداد من قالب غير نشط. |
| لا تعرض القوالب المكررة | إذا كان الأصل مرتبطًا بالقالب مسبقًا. |
| أنشئ علاقة فريدة | asset_id + meter_template_id يجب أن تكون فريدة للعداد النشط. |
| أنشئ initial reading عند وجود initial_value | القراءة الأولية تستخدم start_date. |
| احفظ الإعدادات المنسوخة من القالب | بعض الخصائص تصبح قابلة للتعديل على مستوى Asset Meter. |

---

## 8. حذف عداد من أصل

يسمح النظام بحذف علاقة العداد بالأصل فقط إذا لم توجد أي قراءة تاريخية بعد القراءة الأولية.

| الحالة | الإجراء المسموح |
|---|---|
| لا توجد قراءات أو توجد Initial فقط | حذف Asset Meter وحذف القراءة الأولية إن وجدت. |
| توجد قراءات تشغيلية | لا تحذف؛ استخدم end_date لتعطيل العداد. |
| القالب نفسه | لا يُحذف عند حذف العلاقة؛ يبقى متاحًا لأصول أخرى. |

في الأنظمة الإنتاجية، الأفضل الاعتماد على **end dating** بدل الحذف الفعلي لحماية التاريخ.

---

## 9. تسجيل Meter Readings

يمكن تسجيل القراءات من:

| المصدر | الاستخدام |
|---|---|
| Asset > Meters > Enter Reading | إدخال يدوي لقراءات الأصل. |
| Work Order Operation Completion | تسجيل القراءة أثناء Complete with Details. |
| REST API | إنشاء قراءات متسلسلة زمنيًا. |
| File-Based Data Import | تحميل قراءات جماعية متسلسلة. |
| IoT Asset Monitoring | قراءات تلقائية من الحساسات. |

### 9.1 حقول إدخال القراءة

| الحقل | الوصف |
|---|---|
| reading_type | نوع القراءة، وقد يتحول إلى Reset إذا كان الحدث reset. |
| new_reading | قيمة القراءة الجديدة. |
| rollover | مؤشر لحدوث rollover، فقط Absolute + Ascending. |
| reading_datetime | تاريخ ووقت القراءة. |
| comments | ملاحظات اختيارية. |
| source_type | Manual / WorkOrder / REST / Import / IoT. |
| work_order_id | يعبأ إذا جاءت القراءة من إكمال أمر عمل. |

### 9.2 قواعد التسجيل

| القاعدة | التطبيق |
|---|---|
| القراءة الجديدة عادة تكون متسلسلة بالوقت | date/time يجب أن يكون بعد أو مساويًا لآخر قراءة. |
| لا يسمح بتكرار القراءة بنفس التاريخ والوقت للعداد النشط | unique active reading per asset meter/date-time. |
| يمكن إدخال قراءة تاريخية بين قراءات موجودة | فقط من صفحة Enter Readings. |
| REST وImport لا يدعمان out-of-sequence readings | يستخدمان فقط القراءات المتسلسلة. |
| عند إدخال قراءة تاريخية | النظام يلغي القراءات اللاحقة ويعيد إنشاء replacement readings بقيم محسوبة جديدة. |
| لا يمكن الإدخال قبل آخر locked date | للحفاظ على تكامل قراءة مقفلة بواسطة حلول أخرى. |
| يمكن التسجيل لعداد inactive | فقط إذا كان تاريخ القراءة قبل end_date. |
| إذا كان meter mandatory عند إكمال أمر العمل | يجب إدخال كل قراءات العدادات المطلوبة. |

---

## 10. قواعد التحقق حسب نوع العداد

| Meter Type | Reading Type | Direction | Validation عند إدخال القراءة |
|---|---|---|---|
| Continuous | Absolute | Ascending | وقت القراءة >= آخر وقت، والقيمة >= آخر قيمة، إلا عند rollover/reset المسموح. |
| Continuous | Absolute | Descending | وقت القراءة >= آخر وقت، والقيمة <= آخر قيمة. |
| Continuous | Change | Ascending | وقت القراءة >= آخر وقت، والقيمة تتبع قواعد القالب، وقد تتحقق من Min/Max. |
| Continuous | Change | Descending | وقت القراءة >= آخر وقت، والقيمة تتبع قواعد القالب، وقد تتحقق من Min/Max. |
| Gauge | Absolute | Bidirectional | وقت القراءة >= آخر وقت، والقيمة تتحقق من Min/Max إذا وُجدت. |

---

## 11. حساب Net Change وDisplayed وLife-to-Date

### 11.1 Net Change

```text
For Absolute meters:
Net Change = Current Displayed Reading - Previous Displayed Reading

For Change meters:
Net Change = Current Reading Value
```

### 11.2 Displayed Reading

Displayed Reading تمثل القيمة الظاهرة على العداد الفعلي:

| الحالة | الحساب |
|---|---|
| Absolute | displayed_reading = reading_value |
| Change | displayed_reading = previous_displayed_reading + net_change |
| Reset | displayed_reading = reset_value |
| Rollover | displayed_reading = new reading after rollover/min value logic |

### 11.3 Life-to-Date Reading

Life-to-Date تمثل التراكم مدى الحياة ولا تعود للصفر عند reset أو rollover.

| Meter Type | Reading Type | Direction | Life-to-Date |
|---|---|---|---|
| Continuous | Absolute | Ascending | previous_ltd + net_change، مع معالجة reset/rollover. |
| Continuous | Absolute | Descending | غالبًا تساوي القراءة المعروضة. |
| Continuous | Change | Ascending | previous_ltd + reading_value. |
| Continuous | Change | Descending | previous_ltd - reading_value. |
| Gauge | Absolute | Bidirectional | تساوي reading_value وdisplayed_reading. |

---

## 12. قراءة تاريخية Out-of-Sequence

في العادة، القراءات تدخل بالتسلسل الزمني. لكن عند تصحيح بيانات تاريخية، يمكن إدخال قراءة بين قراءات موجودة. عندها يجب أن يقوم النظام بالتالي:

1. يقبل القراءة فقط إذا كانت بعد آخر locked reading.
2. يحدد كل القراءات اللاحقة النشطة.
3. يغير حالتها إلى Canceled أو Superseded.
4. ينشئ replacement readings بنفس التاريخ والوقت والقيم الأصلية.
5. يعيد حساب Net Change وDisplayed وLife-to-Date لكل الصفوف اللاحقة.
6. يحافظ على audit trail يوضح أن إعادة الحساب تمت بسبب إدخال قراءة تاريخية.

هذه الميزة يجب أن تكون من واجهة Enter Readings فقط، وليس من REST أو import.

---

## 13. عرض وتعديل Meter Reading History

صفحة Reading History تعرض آخر 7 أيام افتراضيًا، مع إمكانية تغيير الفترة. تعرض أحدث قراءة أولًا.

### 13.1 الأعمدة المطلوبة

| العمود | هل يمكن تعديله؟ | ملاحظات |
|---|---:|---|
| Reading Type | لا | نوع القراءة المسجلة. |
| Reading Date and Time | نعم، فقط latest active reading | يجب أن يظل مطابقًا لقواعد القالب. |
| Reading Value | نعم، فقط latest active reading | يتبع قواعد القراءة الجديدة. |
| Net Change | لا | محسوب تلقائيًا. |
| Displayed Reading | لا | محسوب تلقائيًا. |
| Life-to-Date Reading | لا | محسوب تلقائيًا. |
| Work Order | لا | يظهر إذا جاءت القراءة من Complete with Details. |
| Comments | نعم | ما عدا قراءة Disabled. |
| Status | لا مباشر | Recorded / Edited / Disabled / Initial / Reset / Rolled over / Canceled. |

### 13.2 تعطيل قراءة تاريخية

يمكن تعطيل قراءة إذا:

| الشرط | القاعدة |
|---|---|
| القراءة بعد آخر reset أو locked reading | لا يمكن تعطيل ما قبل locked/reset. |
| زر Disable متاح | حسب قيود النظام. |
| ليست قراءة locked | locked لا تُعطل. |
| Reset/Rollover | يمكن تعطيلها فقط إذا كانت آخر قراءة active. |

عند تعطيل قراءة، يتم إلغاء القراءات النشطة اللاحقة وإعادة إنشائها كـ replacement readings بقيم محسوبة جديدة.

### 13.3 تعديل قراءة تاريخية غير latest

الطريقة الصحيحة:

```text
Disable old historical reading
      ↓
Insert new reading with same date/time and corrected value
      ↓
Recalculate all future replacement readings
```

---

## 14. Locked Readings

قد تقوم حلول أخرى مثل Subscription Management بقفل قراءة تاريخية، خاصة لأغراض الفوترة. في برنامجك يجب تمثيل ذلك كالتالي:

| المتطلب | التطبيق |
|---|---|
| last_locked_reading_datetime | يظهر في قائمة عدادات الأصل. |
| منع الإدخال قبل القفل | لا يسمح بقراءة تاريخها <= آخر locked date. |
| منع disable قبل القفل | لا يسمح بتعطيل قراءة قبل آخر locked date. |
| القفل مصدره نظام آخر | لا تجعل مستخدم الصيانة يقفل القراءة يدويًا إلا إذا كان لديك سبب عمل واضح. |

---

## 15. تحديث Asset Meter Details

عند ربط القالب بالأصل، تنسخ بعض القيم من القالب إلى Asset Meter، ثم يمكن تعديلها على مستوى الأصل.

| الحقل | الوصف |
|---|---|
| record_at_work_order_completion | Do not allow / Optional / Mandatory. |
| allow_schedule_maintenance | هل يمكن استخدام العداد في برنامج صيانة. لا يطبق على Gauge. |
| estimated_daily_utilization_rate | معدل الاستخدام اليومي المتوقع للتوقعات. |
| readings_for_utilization_rate | عدد القراءات المستخدمة لحساب معدل استخدام تاريخي. |
| calculated_utilization_rate_per_day | قيمة read-only بعد وجود تاريخ كافٍ. |

### 15.1 معادلة Calculated Utilization Rate

```text
Calculated Utilization Rate =
(End Reading Net Value - Start Reading Net Value) / Number of Days
```

مثال:

```text
Start = 10,000 miles on day 1
End   = 12,000 miles on day 11
Days  = 10
Rate  = (12,000 - 10,000) / 10 = 200 miles/day
```

قواعد مهمة:

| القاعدة | التطبيق |
|---|---|
| عند توليد calculated rate | يتجاهل النظام base utilization rate للتوقعات. |
| تغيير عدد القراءات قد يغير due dates | لأنه يعيد حساب معدل الاستخدام عند القراءة التالية. |
| جعل number_of_readings = 0 بعد توليد rate لا يوقف الحساب | قد لا يكون طريقة صحيحة لتعطيل الحساب. |
| لا تستخدم هذه الميزة قبل وجود تاريخ كافٍ | حتى لا تكون القراءة الأولية الكبيرة سببًا في معدل غير منطقي. |
| لا تنطبق على Gauge | فقط Absolute أو Change باتجاه Ascending. |

---

## 16. Mass Association of Meter Templates

يجب دعم scheduled process باسم وظيفي مثل:

```text
Perform a Mass Association of Meter Templates
```

### 16.1 التشغيل من Scheduled Processes

| المعامل | الوصف |
|---|---|
| meter_template_id أو meter_template_name | اختياري، لتشغيل العملية لقالب محدد. |

بعد التشغيل يجب أن يعرض log:

| المعلومة | الوصف |
|---|---|
| parameters | المعاملات المستخدمة. |
| newly_associated_assets | الأصول التي أضيف لها العداد. |
| already_associated_assets | الأصول التي كانت مرتبطة مسبقًا. |
| skipped_assets | أصول غير مؤهلة أو انتهت صلاحيتها. |
| errors | مشاكل التحقق أو البيانات. |

### 16.2 التشغيل من صفحة Meter Template

من صفحة القالب، عند وجود applicable items، يستطيع المستخدم تشغيل Schedule Mass Asset Update في سياق الأصناف المحددة. تحفظ العملية process_id ليتابعها المستخدم من Scheduled Processes.

---

## 17. REST API المطلوب

### 17.1 Meter Template API

| API | الوظيفة |
|---|---|
| GET /meter-templates | البحث عن القوالب. |
| POST /meter-templates | إنشاء قالب. |
| GET /meter-templates/{id} | عرض قالب. |
| PATCH /meter-templates/{id} | تعديل محدود حسب القيود. |
| POST /meter-templates/{id}/applicability | إضافة item applicability. |
| GET /meter-templates/{id}/applicability | عرض الأصناف المنطبقة. |
| PATCH /meter-templates/{id}/applicability/{applicabilityId} | تعديل end date أو خصائص مسموحة. |
| POST /meter-templates/{id}/mass-association-jobs | تشغيل ربط جماعي. |

### 17.2 Asset Meter API

| API | الوظيفة |
|---|---|
| GET /assets/{assetId}/meters | عرض عدادات أصل. |
| POST /assets/{assetId}/meters | ربط قالب عداد بالأصل. |
| GET /assets/{assetId}/meters/{assetMeterId} | تفاصيل عداد أصل. |
| PATCH /assets/{assetId}/meters/{assetMeterId} | تحديث إعدادات Asset Meter. |
| DELETE /assets/{assetId}/meters/{assetMeterId} | حذف فقط إذا لا توجد قراءات بعد initial. |
| PATCH /assets/{assetId}/meters/{assetMeterId}/end-date | تعطيل العداد بتاريخ. |

### 17.3 Meter Reading API

| API | الوظيفة |
|---|---|
| GET /asset-meters/{assetMeterId}/readings | عرض تاريخ القراءات. |
| POST /asset-meters/{assetMeterId}/readings | إنشاء قراءة متسلسلة. |
| PATCH /meter-readings/{readingId}/comments | تعديل التعليقات. |
| PATCH /meter-readings/{readingId}/latest | تعديل آخر قراءة نشطة فقط. |
| POST /meter-readings/{readingId}/disable | تعطيل قراءة حسب القيود. |
| POST /asset-meters/{assetMeterId}/historical-readings | إدخال قراءة تاريخية من UI فقط، أو اجعلها endpoint داخلي protected. |

قواعد REST المهمة:

| القاعدة | التطبيق |
|---|---|
| إنشاء القراءات عبر REST متسلسل فقط | لا يدعم out-of-sequence. |
| لا يمكن تحديث date/time/value لأي قراءة عادية عبر REST | يمكن تعطيل قراءة تاريخية فقط إذا كانت بعد locked date. |
| reset/rollover reading يمكن تعطيلها فقط إذا كانت آخر active reading | ولا تكون locked. |
| بعد disable | يعاد إنشاء التاريخ اللاحق وتحديث net/displayed/ltd. |

---

## 18. Auto Association عند إنشاء الأصل

عند إنشاء أصل جديد يدويًا أو عبر service أو upload، يجب أن يبحث النظام عن meter template applicability مطابقة لصنف الأصل.

```text
New Asset Created
      ↓
Get asset.item_id
      ↓
Find active meter_template_applicability by master organization + item
      ↓
Create asset_meter for each matching template
      ↓
Create initial reading if template.initial_value exists
```

قواعد مهمة:

| القاعدة | التطبيق |
|---|---|
| applicability على مستوى master organization | لأن الصنف يعرف في master ثم يستخدم في المنظمات المرتبطة. |
| start_date مطلوب | لتفعيل الانطباق. |
| end_date اختياري | إذا وصل التاريخ تصبح applicability غير فعالة. |
| لا تكرر Asset Meter | إذا كان الأصل مرتبطًا بالقالب مسبقًا. |
| يدعم copy asset | يمكن نسخ العدادات مع منع التكرار إذا وجدت templates تلقائية. |

---

## 19. IoT Asset Monitoring

يدعم الفصل إنشاء قراءات عداد تلقائيًا من Oracle IoT Asset Monitoring. في برنامجك، يمكنك تصميم تكامل عام مع أي منصة حساسات.

```text
Sensor Device
      ↓
Sensor Attribute
      ↓
IoT Asset / Digital Twin
      ↓
Asset Meter Mapping
      ↓
Meter Reading Created in Maintenance
```

### متطلبات التكامل

| المتطلب | الوصف |
|---|---|
| asset_iot_enabled | الأصل قابل للمزامنة مع IoT. |
| sensor_attribute_mapping | ربط خاصية الحساس بعداد الأصل. |
| reading_source = IoT | تمييز مصدر القراءة. |
| validation pipeline | تمرير القراءة عبر قواعد القالب. |
| error queue | حفظ القراءات الفاشلة بسبب قيمة أو وقت غير صحيح. |
| no physical access required | تظهر القراءات من الجهاز مباشرة داخل نظام الصيانة. |

---

## 20. Import / Export Meter Readings

يجب دعم File-Based Data Import لإنشاء أو تحديث القراءات جماعيًا.

| العملية | الوصف |
|---|---|
| Import asset meter readings | إنشاء قراءات متسلسلة بالقيمة والتاريخ/الوقت. |
| Import subscription meter readings | دعم قراءات مرتبطة باشتراكات إذا احتاج النظام. |
| Export readings | تصدير التاريخ للتحليل أو التصحيح. |
| Purge interface data | حذف بيانات interface التي فشلت أو أعطت warning/error. |

قواعد مهمة:

| القاعدة | التطبيق |
|---|---|
| Import لا يدعم out-of-sequence | فقط تسلسلي. |
| batch_code فريد | لتتبع كل دفعة. |
| status per row | Pending / Imported / Warning / Error / Purged. |
| purge process | يمكن تشغيله عند الحاجة أو بجدولة. |

---

## 21. الجداول المقترحة للفصل 5

```text
meter_templates
meter_template_applicability
asset_meters
meter_readings
meter_reading_events
meter_reading_replacements
meter_reading_locks
meter_mass_association_jobs
meter_mass_association_job_lines
meter_import_batches
meter_import_rows
asset_meter_iot_mappings
```

### 21.1 meter_templates

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| code | varchar unique |
| name | varchar |
| description | text |
| uom_id | uuid / bigint |
| meter_type | CONTINUOUS / GAUGE |
| reading_type | ABSOLUTE / CHANGE |
| reading_direction | ASCENDING / DESCENDING / BIDIRECTIONAL |
| start_date | date |
| end_date | date |
| initial_value | numeric |
| reading_min_value | numeric |
| reading_max_value | numeric |
| reset_allowed | boolean |
| reset_value | numeric |
| rollover_allowed | boolean |
| rollover_min_value | numeric |
| rollover_max_value | numeric |
| record_at_wo_completion | DO_NOT_ALLOW / MANDATORY |
| allow_schedule_maintenance | boolean |
| estimated_daily_utilization_rate | numeric |
| readings_for_utilization_rate | integer |
| status | ACTIVE / INACTIVE |

### 21.2 asset_meters

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| asset_id | FK assets |
| meter_template_id | FK meter_templates |
| name/code snapshot | optional |
| start_date | date |
| end_date | date |
| record_at_wo_completion | DO_NOT_ALLOW / OPTIONAL / MANDATORY |
| allow_schedule_maintenance | boolean |
| estimated_daily_utilization_rate | numeric |
| readings_for_utilization_rate | integer |
| calculated_utilization_rate_per_day | numeric read-only |
| last_reading_datetime | timestamp |
| last_locked_reading_datetime | timestamp |
| status | ACTIVE / INACTIVE |

### 21.3 meter_readings

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| asset_meter_id | FK asset_meters |
| reading_type | ABSOLUTE / CHANGE / RESET / ROLLOVER |
| reading_value | numeric |
| net_change_value | numeric |
| displayed_reading_value | numeric |
| life_to_date_reading_value | numeric |
| reading_datetime | timestamp |
| source_type | MANUAL / WORK_ORDER / REST / IMPORT / IOT |
| work_order_id | nullable FK |
| comments | text |
| status | INITIAL / RECORDED / EDITED / DISABLED / CANCELED / REPLACEMENT / RESET / ROLLED_OVER |
| is_active | boolean |
| disabled_at | timestamp |
| disabled_by | uuid |
| replaced_by_reading_id | nullable uuid |
| original_reading_id | nullable uuid |
| locked | boolean |

---

## 22. SQL مبدئي مختصر

```sql
CREATE TABLE meter_templates (
    id UUID PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    uom_id UUID,
    meter_type VARCHAR(32) NOT NULL CHECK (meter_type IN ('CONTINUOUS', 'GAUGE')),
    reading_type VARCHAR(32) NOT NULL CHECK (reading_type IN ('ABSOLUTE', 'CHANGE')),
    reading_direction VARCHAR(32) NOT NULL CHECK (reading_direction IN ('ASCENDING', 'DESCENDING', 'BIDIRECTIONAL')),
    start_date DATE NOT NULL,
    end_date DATE,
    initial_value NUMERIC(18,6),
    reading_min_value NUMERIC(18,6),
    reading_max_value NUMERIC(18,6),
    reset_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    reset_value NUMERIC(18,6),
    rollover_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    rollover_min_value NUMERIC(18,6),
    rollover_max_value NUMERIC(18,6),
    record_at_wo_completion VARCHAR(32) NOT NULL DEFAULT 'DO_NOT_ALLOW',
    allow_schedule_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_daily_utilization_rate NUMERIC(18,6),
    readings_for_utilization_rate INTEGER,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meter_template_applicability (
    id UUID PRIMARY KEY,
    meter_template_id UUID NOT NULL REFERENCES meter_templates(id),
    master_organization_id UUID NOT NULL,
    item_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    UNIQUE (meter_template_id, master_organization_id, item_id)
);

CREATE TABLE asset_meters (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id),
    meter_template_id UUID NOT NULL REFERENCES meter_templates(id),
    start_date DATE NOT NULL,
    end_date DATE,
    record_at_wo_completion VARCHAR(32) NOT NULL DEFAULT 'DO_NOT_ALLOW',
    allow_schedule_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_daily_utilization_rate NUMERIC(18,6),
    readings_for_utilization_rate INTEGER,
    calculated_utilization_rate_per_day NUMERIC(18,6),
    last_reading_datetime TIMESTAMP,
    last_locked_reading_datetime TIMESTAMP,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (asset_id, meter_template_id)
);

CREATE TABLE meter_readings (
    id UUID PRIMARY KEY,
    asset_meter_id UUID NOT NULL REFERENCES asset_meters(id),
    reading_type VARCHAR(32) NOT NULL,
    reading_value NUMERIC(18,6),
    net_change_value NUMERIC(18,6),
    displayed_reading_value NUMERIC(18,6),
    life_to_date_reading_value NUMERIC(18,6),
    reading_datetime TIMESTAMP NOT NULL,
    source_type VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    work_order_id UUID,
    comments TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'RECORDED',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    disabled_at TIMESTAMP,
    disabled_by UUID,
    original_reading_id UUID REFERENCES meter_readings(id),
    replaced_by_reading_id UUID REFERENCES meter_readings(id),
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ux_meter_readings_active_datetime
ON meter_readings(asset_meter_id, reading_datetime)
WHERE is_active = TRUE;
```

---

## 23. خدمات الدومين المطلوبة

| الخدمة | المسؤولية |
|---|---|
| MeterTemplateService | إنشاء وتعديل القوالب والتحقق من أنواعها. |
| AssetMeterService | ربط القوالب بالأصول، delete/end-date، تحديث إعدادات الأصل. |
| MeterReadingService | إدخال القراءة وحساب net/displayed/ltd. |
| ReadingHistoryRecalculationService | إعادة حساب التاريخ عند قراءة تاريخية أو disable. |
| MeterForecastRateService | حساب utilization rate من عدد القراءات. |
| MeterApplicabilityService | تحديد القوالب المنطبقة على صنف الأصل. |
| MeterMassAssociationJob | ربط جماعي للأصول المطابقة. |
| MeterImportService | معالجة دفعات import. |
| IoTMeterReadingIngestionService | استقبال قراءات الحساسات وتحويلها إلى meter readings. |
| MeterLockService | تطبيق آخر locked reading date من الأنظمة الخارجية. |

---

## 24. قواعد التحقق المهمة

| القاعدة | رسالة خطأ مقترحة |
|---|---|
| Meter Code يجب أن يكون فريدًا | Meter template code already exists |
| Gauge يجب أن يكون Absolute + Bidirectional | Gauge meters must use absolute bidirectional readings |
| Rollover فقط Continuous Absolute Ascending | Rollover is only allowed for continuous absolute ascending meters |
| Reset فقط Ascending | Reset is only allowed for ascending meters |
| Ascending forecast فقط | Only ascending meters should schedule maintenance forecasts |
| لا يمكن إنشاء Asset Meter مكرر | Meter is already associated with this asset |
| لا يمكن حذف Asset Meter له قراءات بعد initial | Asset meter has reading history and can't be deleted |
| لا يمكن إدخال قراءة بتاريخ مكرر | Duplicate active meter reading date/time |
| لا يمكن إدخال قراءة قبل locked date | Reading date must be after the last locked reading |
| لا يمكن تعطيل قراءة locked | Locked readings can't be disabled |
| لا يمكن تعطيل reset/rollover إلا إذا كانت آخر قراءة | Reset or rollover reading can only be disabled if it is the last active reading |
| Import/REST لا يدعمان قراءة تاريخية out-of-sequence | Historical out-of-sequence readings must be entered from the UI |
| Mandatory work order completion requires all readings | All mandatory asset meter readings are required |

---

## 25. الصلاحيات المقترحة

| الوظيفة | Maintenance Manager | Maintenance Technician | Asset Administrator |
|---|---:|---:|---:|
| إنشاء Meter Template | نعم | لا | نعم |
| تعديل Meter Template | نعم | لا | نعم |
| إضافة Applicable Items | نعم | لا | نعم |
| تشغيل Mass Association | نعم | لا | نعم |
| ربط Meter بأصل | نعم | محدود | نعم |
| حذف أو end-date Asset Meter | نعم | لا | نعم |
| تسجيل قراءة يدوية | نعم | نعم |
| تسجيل قراءة عند إكمال أمر العمل | نعم | نعم |
| تعديل آخر قراءة | نعم | محدود |
| تعطيل قراءة تاريخية | نعم | لا أو محدود |
| تشغيل Import | نعم | لا | نعم |
| إدارة IoT Mapping | نعم | لا | نعم |
| عرض Reading History | نعم | نعم | نعم |

---

## 26. Backlog تنفيذي للفصل 5

| الأولوية | المهمة |
|---|---|
| P0 | إنشاء جداول meter_templates وasset_meters وmeter_readings. |
| P0 | بناء MeterTemplateService مع قواعد Continuous/Gauge. |
| P0 | بناء AssetMeterService لربط قالب بالأصل ومنع التكرار. |
| P0 | بناء MeterReadingService لحساب net/displayed/ltd. |
| P0 | تنفيذ إدخال قراءة يدوية متسلسلة. |
| P0 | منع duplicate reading datetime. |
| P1 | شاشة Manage Meter Templates. |
| P1 | تبويب Meters داخل Edit Asset. |
| P1 | Reading History page. |
| P1 | Delete/end-date asset meter rules. |
| P1 | Reset/Rollover logic. |
| P1 | Work Order Completion reading requirement placeholder. |
| P2 | Historical out-of-sequence recalculation. |
| P2 | Disable reading + replacement rows. |
| P2 | Calculated utilization rate. |
| P2 | Meter Template applicability + auto association. |
| P2 | Mass Association scheduled job. |
| P3 | REST API كامل. |
| P3 | FBDI import/export. |
| P3 | IoT sensor ingestion. |
| P3 | Locked readings integration. |

---

## 27. خلاصة الفصل 5

الفصل الخامس يحول الأصل من سجل ثابت إلى كيان قابل للقياس والتنبؤ. يجب أن يدعم برنامجك قوالب عدادات قابلة لإعادة الاستخدام، ربط القوالب بالأصول، تسجيل قراءات دقيقة، حساب القيم التراكمية، دعم reset وrollover، منع التعديل الخاطئ للتاريخ، وربط العدادات بالتوقعات الوقائية وأوامر العمل وIoT والاستيراد.

هذا الفصل هو الأساس الذي ستعتمد عليه برامج الصيانة الوقائية في فصل Maintenance Programs لاحقًا، لذلك يجب تصميمه بعناية، خصوصًا حساب Life-to-Date وإعادة حساب التاريخ عند التصحيح.



<!-- FILE: docs/domain-model-ch01-05.md -->

# Domain Model — Chapters 1–3

## هدف النموذج

هذا الملف يعطي Cursor خريطة الكيانات والعلاقات التي يجب أن يبحث عنها داخل المشروع الحالي أو ينشئها إذا لم تكن موجودة.

---

## Core Entities

### User

يمثل مستخدمًا في النظام.

Fields:

- id
- name
- email
- status

Relations:

- many roles through user_roles

---

### Role

يمثل دورًا وظيفيًا مثل Maintenance Manager أو Maintenance Technician.

Fields:

- id
- code
- name
- description

Suggested roles:

- MAINTENANCE_MANAGER
- MAINTENANCE_TECHNICIAN

---

### Permission

صلاحية صغيرة قابلة للتجميع داخل دور.

Examples:

- maintenance.organization.manage
- maintenance.work_area.manage
- maintenance.resource.manage
- maintenance.work_center.manage
- maintenance.work_order.manage
- maintenance.work_order.execute
- maintenance.cost.review

---

### MaintenanceOrganization

يمثل منظمة صيانة.

Fields:

- id
- code
- name
- inventory_org_id
- is_maintenance_enabled
- is_project_tracked
- timezone
- default_calendar_id
- status
- inactive_on

Relations:

- has many work areas
- has many resources
- has many work centers through work areas

---

### WorkArea

يمثل منطقة عمل داخل منظمة.

Fields:

- id
- organization_id
- code
- name
- description
- status
- inactive_on

Relations:

- belongs to maintenance organization
- has many work centers

---

### Resource

يمثل موردًا عامًا: عمالة أو معدات.

Fields:

- id
- organization_id
- code
- name
- type: LABOR | EQUIPMENT
- usage_uom
- default_expenditure_type_id
- status
- inactive_on

Relations:

- belongs to organization
- has many resource instances
- linked to many work centers through work_center_resources

---

### ResourceInstance

يمثل النسخة الفعلية من المورد.

Fields:

- id
- resource_id
- organization_id
- type
- identifier
- name
- person_id
- person_type
- asset_id
- asset_number
- primary_work_center_id
- status
- inactive_on

Rules:

- Labor instance can belong to one resource only.
- Equipment instance may link to an asset.
- identifier must be unique.

---

### WorkCenter

يمثل مركز تنفيذ الصيانة.

Fields:

- id
- organization_id
- work_area_id
- code
- name
- description
- status
- inactive_on

Relations:

- belongs to work area
- has many work_center_resources

---

### WorkCenterResource

جدول ربط بين مركز العمل والمورد.

Fields:

- id
- work_center_id
- resource_id
- default_units_available
- available_24_hours
- check_capable_to_promise
- utilization_percent
- efficiency_percent
- status
- inactive_on

Rules:

- usage_uom cannot change once resource is linked here.
- utilization and efficiency affect scheduling duration.

---

### WorkCenterResourceShift

توزيع توفر مورد داخل مركز عمل حسب وردية.

Fields:

- id
- work_center_resource_id
- shift_id
- available_units
- effective_from
- effective_to

Rules:

- Not allowed when available_24_hours is true.

---

### ResourceCalendarException

استثناء لتوفر مورد داخل مركز عمل.

Fields:

- id
- work_center_resource_id
- exception_type
- start_datetime
- end_datetime
- availability_units
- reason
- status

Rules:

- Work center resource exceptions override production calendar exceptions.

---

## Chapter 1 Preview Entities

هذه الكيانات ستفصل في الفصول اللاحقة، لكنها تظهر في الفصل الأول كأجزاء من الخريطة العامة:

- Asset
- AssetMeter
- MeterReading
- StandardOperation
- WorkDefinition
- WorkDefinitionOperation
- WorkOrder
- WorkOrderOperation
- WorkOrderMaterial
- WorkOrderResource
- MaintenanceException
- ExecutionTransaction
- ReportJob
- ImportBatch
- ProcurementReference
- InventoryReservation
- CostRecord
- ProjectReference

---

## Relationship Diagram

```text
User ──< UserRole >── Role ──< RolePermission >── Permission

MaintenanceOrganization
 ├── WorkArea
 │    └── WorkCenter
 │         └── WorkCenterResource >── Resource
 │              ├── WorkCenterResourceShift
 │              └── ResourceCalendarException
 └── Resource
      └── ResourceInstance
```

---

## Implementation Notes for Cursor

- ابحث أولًا إن كان المشروع لديه كيانات مشابهة قبل إنشاء جداول جديدة.
- إذا وجدت modules مثل `organization`, `inventory`, `assets`, `work-orders` فادمج هذه المتطلبات معها بدل إنشاء نطاق منفصل متكرر.
- استخدم enum واضح لحالات Active/Inactive.
- لا تحذف بيانات master data المستخدمة. استخدم `inactive_on` أو soft delete.
- اجعل الحقول الإنجليزية في الكود حتى يكون المشروع قابلًا للتوسع، مع دعم الترجمة في الواجهة.


---

# Domain Model Addendum — Chapter 3 Assets

## Core asset aggregate

```text
Asset
 ├─ AssetLocationHistory
 ├─ AssetImage / AssetAttachment
 ├─ AssetPartListLine
 ├─ AssetPhysicalHierarchyRelationship
 ├─ AssetLogicalHierarchyNode
 ├─ AssetNote
 ├─ AssetHistoryEvent
 ├─ AssetCostRecord
 ├─ AssetFixedAssetLink
 ├─ AssetIoTSyncEvent
 ├─ AssetSalesOrderDetail
 └─ AssetExternalReference
```

## Key relationships

| From | To | Relation |
|---|---|---|
| assets | maintenance_organizations | many-to-one via operating_organization_id |
| assets | items | many-to-one via item_id |
| assets | customers | many-to-one for customer assets |
| assets | maintenance_work_centers | optional many-to-one when location_type = WORK_CENTER |
| assets | asset_parts_list | one-to-many |
| assets | asset_physical_hierarchy | one-to-many as parent/child |
| asset_logical_hierarchies | asset_logical_hierarchy_nodes | one-to-many |
| assets | asset_notes | one-to-many |
| assets | asset_history | one-to-many |
| assets | asset_costs | one-to-many |
| assets | asset_fixed_asset_links | one-to-many |

## Enums

```text
asset_type = ENTERPRISE | CUSTOMER
asset_tracking_method = FULL_LIFECYCLE | CUSTOMER_ASSET_TRACKING
location_type = CUSTOMER_ADDRESS | EXTERNAL_ADDRESS | INTERNAL_ADDRESS | UNKNOWN | WORK_CENTER | INVENTORY
work_order_type = CORRECTIVE | PREVENTIVE
work_order_subtype = CONDITION_BASED | EMERGENCY | PLANNED | REACTIVE | SAFETY | UNDER_WARRANTY
logical_route_reporting = AUTOMATICALLY | MANUALLY
history_group = ASSET_CHANGES | INVENTORY_AND_SALES | WORK_ORDERS_AND_INSPECTIONS
```


---

# الفصل 4 — Domain Model Extension: Asset Groups

## الكيانات الجديدة

| الكيان | الغرض |
|---|---|
| AssetGroupRule | قاعدة تعريف المجموعات وخصائص التجميع والاستخدامات. |
| AssetGroupRuleAttribute | خاصية تجميع يجب أن تملك المجموعة قيمة لها ويطابقها الأصل. |
| AssetGroupRuleUsage | استخدام القاعدة في Order Entry أو Subscriptions أو Customer Asset Status. |
| AssetGroup | مجموعة أصول فعلية تحت قاعدة واحدة. |
| AssetGroupAssignment | علاقة أصل بمجموعة، مع تاريخ بداية ونهاية وسبب الانتهاء. |
| AssetGroupCustomFieldDefinition | تعريف حقول مخصصة لمجموعة الأصل. |
| AssetGroupCustomFieldValue | قيم الحقول المخصصة للمجموعة. |

## العلاقات

```text
AssetGroupRule 1 ── * AssetGroupRuleAttribute
AssetGroupRule 1 ── * AssetGroupRuleUsage
AssetGroupRule 1 ── * AssetGroup
AssetGroup 1 ── * AssetGroupAssignment
Asset 1 ── * AssetGroupAssignment
AssetGroup 1 ── * AssetGroupCustomFieldValue
```

## قواعد الدومين الأساسية

- Rule يجب أن يسبق Group.
- Group يجب أن يسبق Assignment.
- إذا كانت القاعدة تفرض unique assignment، فلا يمكن للأصل أن يكون في أكثر من مجموعة نشطة تحت نفس القاعدة.
- إذا كانت المجموعة تحتوي grouping values، يجب أن يطابقها الأصل قبل الإسناد.
- تغيير الأصل قد يؤدي إلى end-date تلقائي للإسناد.
- End-date الأصل يؤدي إلى end-date لإسناداته.
- Customer Asset Status usage له قيود خاصة: قاعدة واحدة فقط، unique assignment مفعل، grouping attributes معطلة، ولا يدمج مع usages أخرى.


---

# Chapter 5 Domain Model — Meters for Assets

```text
MeterTemplate
 ├── MeterTemplateApplicability
 └── AssetMeter
       ├── MeterReading
       ├── MeterReadingLock
       └── AssetMeterIoTMapping

MeterMassAssociationJob
 └── MeterMassAssociationJobLine

MeterImportBatch
 └── MeterImportRow
```

## Entities

| Entity | Responsibility |
|---|---|
| MeterTemplate | Reusable definition of meter behavior and validations. |
| MeterTemplateApplicability | Item-level applicability that enables automatic association. |
| AssetMeter | Unique association between an asset and a meter template. |
| MeterReading | Historical reading with recorded and calculated values. |
| MeterReadingLock | External lock boundary, usually from billing/subscription flows. |
| MeterMassAssociationJob | Background job that associates templates to matching assets. |
| MeterImportBatch | File-based import execution. |
| AssetMeterIoTMapping | Maps sensor attributes to asset meters. |

## Critical Invariants

- A template code is unique.
- An asset can't have duplicate active asset meters for the same template.
- Active readings can't share the same asset meter and reading timestamp.
- Life-to-date values must remain cumulative across reset and rollover events.
- Out-of-sequence correction must recalculate future readings.
- REST and import create only sequential readings.
- Locked readings define a boundary for inserts/disables.



<!-- FILE: docs/api-contracts-ch01-05.md -->

# API Contracts — Chapters 1–3

هذه واجهات REST مقترحة. عدّلها حسب نمط مشروعك الحالي: REST، GraphQL، tRPC، Laravel Controllers، Django ViewSets، NestJS Controllers، إلخ.

---

## Common Response Shape

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-10T00:00:00Z"
  }
}
```

## Common Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Work area has active work centers",
    "details": []
  }
}
```

---

# Maintenance Organizations

## List Organizations

`GET /api/maintenance-organizations`

Query:

- `q`
- `status`
- `isProjectTracked`

## Create Organization

`POST /api/maintenance-organizations`

```json
{
  "code": "MNT-PLANT-01",
  "name": "Main Maintenance Plant",
  "inventoryOrgId": "inv_001",
  "isMaintenanceEnabled": true,
  "isProjectTracked": false,
  "timezone": "Asia/Riyadh",
  "defaultCalendarId": "cal_001"
}
```

Validation:

- code unique
- inventoryOrgId required
- timezone required

## Update Organization

`PATCH /api/maintenance-organizations/{id}`

## Check Readiness

`GET /api/maintenance-organizations/{id}/readiness`

Response:

```json
{
  "data": {
    "isReady": false,
    "missing": ["WORK_AREA", "WORK_CENTER"]
  }
}
```

---

# Work Areas

## List Work Areas

`GET /api/work-areas?organizationId=org_001`

## Create Work Area

`POST /api/work-areas`

```json
{
  "organizationId": "org_001",
  "code": "MECH",
  "name": "Mechanical Area",
  "description": "Mechanical maintenance region"
}
```

## Deactivate Work Area

`POST /api/work-areas/{id}/deactivate`

```json
{
  "inactiveOn": "2026-06-10"
}
```

Rules:

- cannot delete if active work centers exist
- deactivation should hide it from new setups

---

# Resources

## List Resources

`GET /api/resources?organizationId=org_001&type=LABOR`

## Create Resource

`POST /api/resources`

```json
{
  "organizationId": "org_001",
  "code": "ELEC-TECH",
  "name": "Electrical Technician",
  "type": "LABOR",
  "usageUom": "HOUR",
  "defaultExpenditureTypeId": null
}
```

Rules:

- type must be LABOR or EQUIPMENT
- usageUom required
- usageUom cannot be changed after work center assignment

## Create Resource Instance

`POST /api/resource-instances`

Labor example:

```json
{
  "resourceId": "res_001",
  "type": "LABOR",
  "identifier": "EMP-1001",
  "name": "Ahmed Electrical Technician",
  "personId": "person_1001",
  "personType": "EMPLOYEE",
  "primaryWorkCenterId": "wc_001"
}
```

Equipment example:

```json
{
  "resourceId": "res_002",
  "type": "EQUIPMENT",
  "identifier": "FL-001",
  "name": "Forklift FL-001",
  "assetId": "asset_001",
  "assetNumber": "A-FL-001",
  "primaryWorkCenterId": "wc_002"
}
```

Rules:

- identifier unique
- labor instance belongs to one resource
- equipment can link to asset

---

# Work Centers

## List Work Centers

`GET /api/work-centers?organizationId=org_001&workAreaId=wa_001`

## Create Work Center

`POST /api/work-centers`

```json
{
  "organizationId": "org_001",
  "workAreaId": "wa_001",
  "code": "WC-MECH-01",
  "name": "Mechanical Repair Center",
  "description": "Primary mechanical repair work center"
}
```

Rules:

- workArea must be active
- code unique in organization

## Add Resource to Work Center

`POST /api/work-centers/{id}/resources`

```json
{
  "resourceId": "res_001",
  "defaultUnitsAvailable": 2,
  "available24Hours": false,
  "checkCapableToPromise": false,
  "utilizationPercent": 100,
  "efficiencyPercent": 100
}
```

## Allocate Resource Shifts

`POST /api/work-center-resources/{id}/shifts`

```json
{
  "shifts": [
    { "shiftId": "shift_day", "availableUnits": 2 },
    { "shiftId": "shift_night", "availableUnits": 0 }
  ]
}
```

Rule:

- if available24Hours is true, do not accept shifts.

---

# Resource Calendar Exceptions

## Create Exception

`POST /api/resource-calendar-exceptions`

```json
{
  "workCenterResourceId": "wcr_001",
  "exceptionType": "MAKE_UNAVAILABLE",
  "startDatetime": "2026-06-15T08:00:00+03:00",
  "endDatetime": "2026-06-15T12:00:00+03:00",
  "availabilityUnits": 0,
  "reason": "Mandatory training"
}
```

## List Calendar Availability

`GET /api/work-centers/{id}/resource-calendar?from=2026-06-01&to=2026-06-30`

---

# Dashboard / Chapter 1

## Landing KPIs

`GET /api/maintenance/dashboard/kpis?organizationId=org_001`

Response:

```json
{
  "data": {
    "currentWorkOrders": 12,
    "pastDueWorkOrders": 3,
    "futureWorkOrders": 8
  }
}
```

## Infolets

`GET /api/maintenance/dashboard/infolets?organizationId=org_001`

Suggested infolets:

- workOrders
- scheduledVsCompletedWork
- workCompletion
- operations
- releasedWorkOrders
- workOrdersWithWorkDefinition
- assetsWithMostWorkOrders
- pastDueOperations
- recommendations

---

# Authorization Hints

Suggested permissions:

```text
maintenance.organization.manage
maintenance.work_area.manage
maintenance.resource.manage
maintenance.resource_instance.manage
maintenance.work_center.manage
maintenance.dashboard.view
maintenance.work_order.manage
maintenance.work_order.execute
maintenance.report.print
maintenance.cost.review
maintenance.import.manage
```


---

# Chapter 3 API Contracts — Assets

## Assets

```http
GET    /assets
POST   /assets
GET    /assets/{assetId}
PATCH  /assets/{assetId}
POST   /assets/{assetId}/copy
POST   /assets/{assetId}/split
POST   /assets/{assetId}/end-date
POST   /assets/{assetId}/favorite
DELETE /assets/{assetId}/favorite
```

### Create Asset payload

```json
{
  "assetType": "ENTERPRISE",
  "assetNumber": "PUMP-1001",
  "description": "Main feed pump",
  "operatingOrganizationId": "uuid",
  "itemId": "uuid",
  "serialNumber": "SN-1001",
  "lotNumber": null,
  "quantity": 1,
  "locationType": "WORK_CENTER",
  "locationOrganizationId": "uuid",
  "workCenterId": "uuid",
  "allowMaintenancePrograms": true,
  "allowWorkOrders": true,
  "defaultWorkOrderType": "PREVENTIVE",
  "defaultWorkOrderSubtype": "PLANNED",
  "enableIot": true
}
```

## Asset parts list

```http
GET    /assets/{assetId}/parts-list
POST   /assets/{assetId}/parts-list
PATCH  /assets/{assetId}/parts-list/{lineId}
DELETE /assets/{assetId}/parts-list/{lineId}
POST   /assets/{assetId}/parts-list/copy-from
```

## Physical hierarchy

```http
GET    /assets/{assetId}/hierarchy
POST   /assets/{assetId}/children
POST   /asset-hierarchy/{relationshipId}/swap
POST   /asset-hierarchy/{relationshipId}/move
DELETE /asset-hierarchy/{relationshipId}
```

## Logical hierarchy and asset routes

```http
GET    /asset-logical-hierarchies
POST   /asset-logical-hierarchies
PATCH  /asset-logical-hierarchies/{hierarchyId}
POST   /asset-logical-hierarchies/{hierarchyId}/nodes
PATCH  /asset-logical-hierarchies/{hierarchyId}/nodes/{nodeId}
DELETE /asset-logical-hierarchies/{hierarchyId}/nodes/{nodeId}
POST   /asset-logical-hierarchies/{hierarchyId}/create-work-order
```

## Notes, history, costs

```http
GET    /assets/{assetId}/notes
POST   /assets/{assetId}/notes
PATCH  /assets/{assetId}/notes/{noteId}
DELETE /assets/{assetId}/notes/{noteId}
GET    /assets/{assetId}/history
GET    /assets/{assetId}/costs
```

## Fixed asset links

```http
GET    /assets/{assetId}/fixed-assets
POST   /assets/{assetId}/fixed-assets
PATCH  /assets/{assetId}/fixed-assets/{linkId}
POST   /assets/{assetId}/fixed-assets/sync-location
POST   /assets/{assetId}/fixed-assets/terminate-sync
```

## Import/export and integrations

```http
POST   /asset-imports
GET    /asset-imports/{batchId}
POST   /asset-imports/{batchId}/purge
POST   /asset-exports
GET    /asset-exports/{jobId}
POST   /assets/{assetId}/iot/sync
GET    /assets/{assetId}/service-refs
POST   /service-mappings
POST   /service-mappings/{mappingId}/publish
POST   /service-mappings/{mappingId}/reprocess-errors
```


---

# Asset Groups — Chapter 4

## List Asset Group Rules

`GET /api/asset-group-rules`

Query:

- `q`
- `code`
- `usage`
- `status`
- `includeInactive`

## Create Asset Group Rule

`POST /api/asset-group-rules`

```json
{
  "name": "Customer Validation Rule",
  "code": "CUSTOMER_VALIDATION",
  "description": "Groups used to exclude assets from contracts or service requests",
  "groupingAttributes": [],
  "usages": ["CUSTOMER_ASSET_STATUS"],
  "enforceUniqueAssignment": true,
  "inactiveOn": null
}
```

Validation:

- `code` must be unique.
- `CUSTOMER_ASSET_STATUS` can't be combined with other usages.
- When `CUSTOMER_ASSET_STATUS` is selected, `groupingAttributes` must be empty.
- When `CUSTOMER_ASSET_STATUS` is selected, `enforceUniqueAssignment` must be true.
- Only one active rule with `CUSTOMER_ASSET_STATUS` is allowed.

## Update Asset Group Rule

`PATCH /api/asset-group-rules/{id}`

Rules:

- `name`, `code`, and `description` are always editable.
- `groupingAttributes` can be changed only if no groups exist for the rule.
- `enforceUniqueAssignment` can be changed only if no active assignments exist under the rule.

## Delete Asset Group Rule

`DELETE /api/asset-group-rules/{id}`

Rules:

- Reject if any asset groups exist under the rule.

---

## List Asset Groups

`GET /api/asset-groups`

Query:

- `q`
- `ruleId`
- `groupNumber`
- `name`
- `usage`
- `status`
- `includeInactive`

## Create Asset Group

`POST /api/asset-groups`

```json
{
  "ruleId": "agr_001",
  "groupNumber": "TRUCKS-1006",
  "name": "Customer 1006 Trucks",
  "description": "Truck assets for customer 1006",
  "groupingValues": {
    "customerNumber": "1006"
  },
  "assetValidationRules": ["EXCLUDE_FROM_CONTRACTS"],
  "inactiveOn": null,
  "customFields": {}
}
```

Validation:

- `ruleId` is required.
- `groupNumber` must be unique.
- The parent rule must not be inactive.
- All grouping attributes defined by the rule must have values.
- `assetValidationRules` can include `EXCLUDE_FROM_CONTRACTS` and `EXCLUDE_FROM_SERVICE_REQUESTS`.

## Update Asset Group

`PATCH /api/asset-groups/{id}`

Rules:

- `name`, `groupNumber`, and `description` are editable.
- `groupingValues` and `assetValidationRules` can be changed only when the group has no assigned assets.

## Delete Asset Group

`DELETE /api/asset-groups/{id}`

Rules:

- Reject if any assignments exist for the group.

---

## Eligible Assets for Group

`GET /api/asset-groups/{id}/eligible-assets`

Response:

```json
{
  "data": [
    {
      "assetId": "asset_001",
      "assetNumber": "A-1001",
      "description": "Truck 1001",
      "matchedAttributes": {
        "customerNumber": "1006"
      }
    }
  ]
}
```

Eligibility rules:

- If the group has no grouping values, return assets not already assigned to the group.
- If the group has grouping values, return only matching assets.
- If the rule enforces unique assignment, exclude assets assigned to another active group under the same rule.

## Assign Assets to Group

`POST /api/asset-groups/{id}/assignments`

```json
{
  "assetIds": ["asset_001", "asset_002"],
  "source": "MANUAL"
}
```

## Unassign Asset from Group

`DELETE /api/asset-groups/{id}/assignments/{assignmentId}`

Recommended behavior:

```json
{
  "endReason": "MANUAL_UNASSIGN"
}
```

Use soft end-dating rather than physical deletion in production data.

## Asset Groups for an Asset

`GET /api/assets/{id}/groups`

## Assign an Asset to a Group from Asset Page

`POST /api/assets/{id}/groups`

```json
{
  "groupId": "ag_001"
}
```

## Unassign an Asset from a Group from Asset Page

`DELETE /api/assets/{id}/groups/{assignmentId}`

---

## Internal Hooks

### Revalidate Group Assignments When Asset Changes

`POST /internal/assets/{id}/asset-group-assignments/revalidate`

Used after asset updates. It should end-date assignments when the asset no longer matches grouping values.

### End-Date Assignments When Asset Ends

`POST /internal/assets/{id}/asset-group-assignments/end-date`

Used when `asset_end_date` or `customer_asset_end_date` changes.


---

# Chapter 5 API Contracts — Meters for Assets

## Meter Templates

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /meter-templates | Search meter templates by code, name, UOM, type, reading type, direction, status. |
| POST | /meter-templates | Create a reusable meter template. |
| GET | /meter-templates/{id} | View meter template details. |
| PATCH | /meter-templates/{id} | Update allowed template attributes. |
| POST | /meter-templates/{id}/applicability | Add item applicability. |
| GET | /meter-templates/{id}/applicability | List applicable items. |
| PATCH | /meter-templates/{id}/applicability/{applicabilityId} | Update applicability end date/status. |
| POST | /meter-templates/{id}/mass-association-jobs | Run mass association for matching assets. |

## Asset Meters

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /assets/{assetId}/meters | List meters associated with an asset. |
| POST | /assets/{assetId}/meters | Associate a template to an asset. |
| GET | /assets/{assetId}/meters/{assetMeterId} | View asset meter details. |
| PATCH | /assets/{assetId}/meters/{assetMeterId} | Update asset-level meter settings. |
| DELETE | /assets/{assetId}/meters/{assetMeterId} | Delete only when no reading history beyond initial exists. |
| PATCH | /assets/{assetId}/meters/{assetMeterId}/end-date | End-date an asset meter. |

## Meter Readings

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /asset-meters/{assetMeterId}/readings | View reading history. |
| POST | /asset-meters/{assetMeterId}/readings | Create a sequential reading. |
| PATCH | /meter-readings/{readingId}/latest | Update latest active reading date/time/value. |
| PATCH | /meter-readings/{readingId}/comments | Update comments. |
| POST | /meter-readings/{readingId}/disable | Disable a reading after last locked/reset reading. |
| POST | /asset-meters/{assetMeterId}/historical-readings | Internal/UI-only endpoint for out-of-sequence correction. |

## Jobs and Integrations

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /meter-imports | Import sequential meter readings. |
| GET | /meter-imports/{batchId} | View import batch status. |
| POST | /meter-imports/{batchId}/purge | Purge failed/warning interface rows. |
| POST | /iot/asset-meter-readings | Ingest IoT sensor readings mapped to asset meters. |



<!-- FILE: docs/backlog-ch01-05.md -->

# Implementation Backlog — Chapters 1–3

استخدم هذا الملف لتقسيم العمل على Cursor أو فريق التطوير. الأفضل تنفيذ كل Epic على حدة.

---

## Epic 1 — Security Roles

### Story 1.1 — Add Maintenance Roles

As an admin, I want predefined maintenance roles so that users can access maintenance features according to responsibility.

Acceptance Criteria:

- Role `MAINTENANCE_MANAGER` exists.
- Role `MAINTENANCE_TECHNICIAN` exists.
- Permissions are granular and not hardcoded.
- Manager has setup permissions.
- Technician has execution/view permissions only.

### Story 1.2 — Permission Guards

Acceptance Criteria:

- Setup routes require manager permission.
- Execution routes allow technician where appropriate.
- Cost review is manager-only.

---

## Epic 2 — Maintenance Organization

### Story 2.1 — Create Organization

Acceptance Criteria:

- User can create a maintenance organization with code, name, inventory org reference, timezone.
- Code is unique.
- Organization can be active/inactive.
- Organization can be marked project-tracked.

### Story 2.2 — Organization Readiness

Acceptance Criteria:

- System returns readiness status.
- Missing Work Area is detected.
- Missing Work Center is detected.
- Organization cannot be used for work orders until ready.

---

## Epic 3 — Work Areas

### Story 3.1 — Manage Work Areas

Acceptance Criteria:

- Manager can create, edit, search, deactivate, reactivate Work Areas.
- Work Area code/name are unique inside organization.
- Inactive Work Areas are hidden from new Work Center creation.

### Story 3.2 — Delete Protection

Acceptance Criteria:

- Work Area cannot be deleted if it has active Work Centers.
- Friendly validation message is returned.

---

## Epic 4 — Resources

### Story 4.1 — Manage Resources

Acceptance Criteria:

- Manager can create resources of type LABOR or EQUIPMENT.
- Resource requires usage UOM.
- Resource can be deactivated/reactivated.

### Story 4.2 — Usage UOM Lock

Acceptance Criteria:

- After resource is assigned to any Work Center, usage UOM cannot change.
- API returns a clear validation error.

---

## Epic 5 — Resource Instances

### Story 5.1 — Labor Instances

Acceptance Criteria:

- Manager can create labor instance from person or manually.
- Identifier is unique.
- Optional primary work center can be assigned.
- Labor instance is not assigned to multiple resources.

### Story 5.2 — Equipment Instances

Acceptance Criteria:

- Manager can create equipment instance from asset or manually.
- If asset is selected, name/identifier/work center can be defaulted.
- Optional asset number is stored for qualification features.

---

## Epic 6 — Work Centers

### Story 6.1 — Manage Work Centers

Acceptance Criteria:

- Manager can create Work Center in an active Work Area.
- Work Center code/name are unique inside organization.
- Work Center can be deactivated/reactivated.

### Story 6.2 — Delete Protection

Acceptance Criteria:

- Cannot delete Work Center with assigned resources.
- Cannot delete Work Center referenced by Work Definition operations.
- Cannot delete Work Center referenced by Work Order operations.

---

## Epic 7 — Work Center Resources and Shifts

### Story 7.1 — Assign Resource to Work Center

Acceptance Criteria:

- Manager can assign a resource to Work Center.
- Can set default units, 24h availability, utilization, efficiency.
- Values are validated.

### Story 7.2 — Shift Allocation

Acceptance Criteria:

- If available 24h is false, manager can allocate units by shift.
- If available 24h is true, shift allocation is blocked.
- Resource availability can be viewed per Work Center.

### Story 7.3 — Scheduling Duration Formula

Acceptance Criteria:

- System exposes function/service to calculate scheduled duration.
- Formula uses required usage, utilization, efficiency.
- Example 1 hour with 50% utilization and 50% efficiency returns 4 hours.

---

## Epic 8 — Dashboard Foundations

### Story 8.1 — Maintenance KPIs

Acceptance Criteria:

- API returns current, past-due, and future work order counts per organization.
- Future horizon defaults to 30 days and is configurable.
- KPIs exclude canceled, closed, and completed orders.

### Story 8.2 — Infolet Configuration

Acceptance Criteria:

- User can hide/reorder infolets or a placeholder is created for future customization.
- Each infolet links to an intended drill-down route.

---

## Epic 9 — Imports and Reports Foundations

### Story 9.1 — Import Batch Skeleton

Acceptance Criteria:

- ImportBatch entity exists.
- Supports type: ASSETS, WORK_DEFINITIONS, WORK_ORDERS, METER_READINGS, MAINTENANCE_PROGRAMS.
- Tracks status, uploaded_by, errors.

### Story 9.2 — Report Job Skeleton

Acceptance Criteria:

- ReportJob entity exists.
- Supports types: WORK_DEFINITION, MATERIAL_LIST, WORK_ORDER_DETAILS.
- Tracks status and output file reference.


---

# Chapter 3 Backlog — Assets

## Epic A3.1 — Asset registry

**User story:** كمدير صيانة أريد إنشاء أصول داخلية وأصول عملاء حتى أتابعها وأربطها بأوامر العمل.

Acceptance criteria:
- يدعم النظام asset_type = ENTERPRISE وCUSTOMER.
- رقم الأصل فريد، ويمكن توليده تلقائيًا إذا لم يدخله المستخدم.
- أصل المؤسسة يحتاج Operating Organization.
- أصل العميل يحتاج Customer وShipment Date.
- الأصل المسلسل quantity = 1 وغير قابل للتعديل.

## Epic A3.2 — Asset search and 360 view

Acceptance criteria:
- بحث keyword في asset number/description/item.
- فلاتر متقدمة للموقع والمنظمة والعميل والسيريال والـlot وحالة IoT.
- saved searches وdefault search.
- Asset 360 يعرض history/cost/work orders/parts/hierarchy links.

## Epic A3.3 — Create/copy/split asset

Acceptance criteria:
- إنشاء أصل من الصفر.
- نسخ أصل موجود مع خيار نسخ meters دون تكرار.
- Use BOM for Initial Hierarchy ينشئ logical placeholder children.
- Split asset يلتزم بقواعد eligibility ولا يحفظ إلا بعد تأكيد المستخدم.

## Epic A3.4 — Parts list

Acceptance criteria:
- إضافة/تعديل/حذف parts list lines.
- منع إضافة item نفس صنف الأصل.
- تجاهل التكرار عند النسخ من أصل آخر.
- التحقق أن item enabled للمنظمات المطلوبة.

## Epic A3.5 — Physical and logical hierarchy

Acceptance criteria:
- إضافة/إنشاء/إزالة/استبدال/نقل child assets.
- child يرث موقع top parent في physical hierarchy.
- logical hierarchy يدعم route fields وreporting automatic/manual.
- Asset Route يفرض وجود route assets كمستوى أول تحت الجذر.

## Epic A3.6 — Asset history, notes, images, cost

Acceptance criteria:
- notes عامة أو خاصة مع صلاحيات.
- صور متعددة وصورة primary.
- history يسجل source/type/group/old/new values.
- cost tab يعرض material/labor/equipment حسب الفترة وأمر العمل.

## Epic A3.7 — Import/export and REST

Acceptance criteria:
- import batch للأصول والأجزاء والcharges والمجموعات.
- purge failed interface data.
- export assets مع charges/children/parts.
- mass edit لا يقبل رفع export مباشرة، بل عبر import template.

## Epic A3.8 — Fixed assets and IoT integrations

Acceptance criteria:
- ربط أصل تشغيلي بأصل ثابت مع valid date range بلا تداخل.
- sync location يتطلب serial-controlled asset وfixed asset quantity one.
- IoT sync عند تحديث الحقول المحددة أو meter changes.
- FBDI لا يطلق IoT sync تلقائيًا.

## Epic A3.9 — Service integrations

Acceptance criteria:
- Service Logistics references للأصل.
- B2B Service opt-in كإعداد عالمي لا يسمح بالنموذجين معًا.
- service mapping من Sales Order Header/Lines إلى DFF/custom fields.
- sandbox/publish/reprocess errors workflow.


---

# Chapter 4 Backlog — Asset Groups

## Epic A4.1 — Asset Group Rules

**User story:** كمدير صيانة أريد تعريف قواعد لمجموعات الأصول حتى تكون المجموعات مبنية على خصائص واضحة وقابلة للتحقق.

Acceptance criteria:
- يمكن إنشاء rule باسم وكود ووصف.
- الكود فريد.
- يمكن اختيار grouping attributes متعددة.
- يمكن اختيار usages حسب القواعد.
- Customer Asset Status لا يجتمع مع استخدامات أخرى.
- عند Customer Asset Status يتم تعطيل grouping attributes وتفعيل unique assignment.
- لا يمكن تعديل grouping attributes بعد إنشاء groups تحت rule.
- لا يمكن حذف rule لديها groups.

## Epic A4.2 — Asset Groups

**User story:** كمدير صيانة أريد إنشاء مجموعات أصول تحت قواعد محددة حتى أصنف الأصول حسب العميل أو الموقع أو خصائص أخرى.

Acceptance criteria:
- كل group يجب أن يرتبط بـ rule.
- group number فريد ويمكن توليده تلقائيًا.
- إذا كان rule يحتوي grouping attributes، يجب إدخال قيمة لكل attribute.
- لا يمكن إنشاء group تحت inactive rule.
- يمكن تعيين asset validation rules: exclude from contracts/service requests.
- لا يمكن تعديل grouping values أو validation rules إذا كانت هناك assignments.
- لا يمكن حذف group لديها assignments.

## Epic A4.3 — Asset Assignments

**User story:** كمدير صيانة أريد إسناد الأصول المؤهلة إلى مجموعات حتى أستخدمها في البحث والتحقق والتكاملات.

Acceptance criteria:
- صفحة Assign Assets تعرض الأصول المؤهلة فقط.
- إذا لم توجد grouping attributes، تعرض كل الأصول غير المسندة للمجموعة.
- إذا وجدت grouping attributes، تعرض الأصول المطابقة فقط.
- إذا كان enforce unique assignment مفعّلًا، لا يظهر أصل مسند لمجموعة أخرى تحت نفس rule.
- إلغاء الإسناد يدعم soft end-date مع end_reason.

## Epic A4.4 — Asset Page Integration

Acceptance criteria:
- Manage Assets يدعم البحث باسم أو رقم المجموعة.
- Edit Asset يحتوي تبويب Asset Groups.
- يمكن إسناد الأصل لمجموعة من تبويب الأصل.
- يمكن إلغاء الإسناد من تبويب الأصل.
- نفس قواعد eligibility تطبق سواء من صفحة المجموعة أو صفحة الأصل.

## Epic A4.5 — Automatic End Dating

Acceptance criteria:
- عند تعديل أصل بحيث لم يعد يطابق grouping values، تنتهي الإسنادات المتأثرة بتاريخ تعديل الأصل.
- عند end-date الأصل، تنتهي كل إسناداته بتاريخ نهاية الأصل.
- إذا كان للأصل active end date وcustomer asset end date، يستخدم customer asset end date.
- صفحة assignments تعرض سبب الانتهاء.

## Epic A4.6 — REST, Import, and Custom Fields

Acceptance criteria:
- REST API لقواعد المجموعات والمجموعات والإسنادات.
- Asset import يستطيع إنشاء/تحديث ارتباط الأصل بالمجموعة.
- asset group يدعم custom_fields في Create/Edit وREST.
- يمكن لاحقًا بناء sandbox/configuration workflow فوق custom fields.

## Epic A4.7 — Validation and Security

Acceptance criteria:
- صلاحيات منفصلة لإنشاء rules وgroups وإسناد assets.
- الفني يستطيع العرض فقط أو حسب سياسة المشروع.
- System/Admin يستطيع إدارة custom fields.
- كل رفض تحقق يعيد رسالة واضحة للمستخدم والـAPI.


---

# Chapter 5 Backlog — Meters for Assets

## Epic: Meter Templates

**User Story:** As a maintenance manager, I want to define reusable meter templates so similar assets use standardized meter behavior.

Acceptance criteria:
- Template code is unique.
- Continuous and Gauge rules are validated.
- Reset and rollover are only allowed for compatible meter types.
- Forecast scheduling is allowed only for non-gauge ascending meters.

## Epic: Asset Meters

**User Story:** As an asset administrator, I want to associate meter templates with assets so each asset has its own reading history.

Acceptance criteria:
- Duplicate template associations are prevented for the same asset.
- Initial reading is created when template initial value exists.
- Inactive templates don't appear in template selection.
- Deletion is blocked when operational reading history exists.

## Epic: Meter Readings

**User Story:** As a technician, I want to record meter readings so asset utilization and conditions are tracked accurately.

Acceptance criteria:
- Sequential readings calculate net change, displayed reading, and life-to-date.
- Duplicate active timestamps are rejected.
- Mandatory readings are enforced during work order completion.
- Inactive meters accept readings only before their end date.

## Epic: Historical Corrections

**User Story:** As a maintenance manager, I want to correct historical readings without corrupting later history.

Acceptance criteria:
- Out-of-sequence readings can be entered only from controlled UI flow.
- Later readings are canceled/superseded and recreated as replacements.
- Values are recalculated after correction.
- Locked readings prevent earlier corrections.

## Epic: Automation and Integrations

**User Story:** As an administrator, I want meters to be created and updated automatically through applicability, import, REST, and IoT.

Acceptance criteria:
- New assets receive matching meters by item applicability.
- Mass association job logs associated, skipped, and already-associated assets.
- REST/import support sequential readings only.
- IoT readings are mapped to asset meters and validated before creation.



<!-- FILE: prompts/cursor_import_prompt_ch05_ar.md -->

# Prompt جاهز لـ Cursor — إضافة الفصل 5: Meters for Assets

اقرأ الملفات التالية أولًا:

- `docs/05-meters-for-assets-requirements.md`
- `docs/domain-model-ch01-05.md`
- `docs/api-contracts-ch01-05.md`
- `docs/backlog-ch01-05.md`
- `db/schema_ch01_05.sql`
- `data/requirements_ch01_05.json`

المطلوب:

1. افحص مشروعنا الحالي وحدد كيف تم تنفيذ الأصول من الفصل 3 ومجموعات الأصول من الفصل 4.
2. لا تغيّر المعمارية الحالية للمشروع إلا للضرورة.
3. أضف دعم Chapter 5 Meters تدريجيًا بهذا الترتيب:
   - MeterTemplate model/table
   - MeterTemplateApplicability model/table
   - AssetMeter model/table
   - MeterReading model/table
   - MeterReadingService لحساب net_change/displayed/life_to_date
   - تبويب أو API `/assets/{assetId}/meters`
   - إدخال قراءة متسلسلة
   - منع duplicate reading datetime
   - delete/end-date asset meter rules
   - reset و rollover
   - reading history
   - REST endpoints
   - tests/migrations
4. لا تضف Maintenance Programs الآن؛ فقط جهز الحقول التي ستحتاجها التوقعات لاحقًا.
5. اجعل out-of-sequence historical correction خدمة منفصلة ولا تستخدمها في REST/import العادي.
6. بعد كل خطوة، اعرض ملخصًا بما أضيف وما بقي.


---

# الفصل 6 — Asset Supplier Warranty / ضمان مورد الأصل

## 1. نطاق الفصل

هذا الفصل يضيف إلى نظام الصيانة وحدة **ضمان مورد الأصل Asset Supplier Warranty**. الهدف منها تتبع ضمان الأصول الداخلية **Enterprise Assets** من لحظة الشراء وحتى انتهاء الخدمة، ثم استخدام بيانات الضمان أثناء تنفيذ أمر العمل لتحديد هل الإصلاح مؤهل لمطالبة تعويض من المورد أم لا.

هذه الوحدة ليست ضمانًا عامًا لكل شيء؛ هي موجهة لضمان المورد على الأصول المؤسسة التي تكون مبنية على أصناف قابلة للتتبع والصيانة والشراء من الموردين. لذلك يجب ربطها بوحدة الأصول، الأصناف، الشراء، أوامر العمل، التنفيذ، التكلفة، والمطالبات.

```text
Supplier Warranty Setup
    ↓
Warranty Coverages
    ↓
Warranty Contracts per Asset
    ↓
Work Order Warranty Review
    ↓
Operation / Material / Resource Transactions
    ↓
Warranty Entitlements
    ↓
Warranty Claims
    ↓
Provider Reimbursement Tracking
```

---

## 2. أين تستخدم هذه الوحدة؟

| الحالة | هل تنطبق الوحدة؟ | التفسير |
|---|---:|---|
| أصل داخلي Enterprise Asset مبني على صنف full life cycle + maintainable + serial controlled + purchasable | نعم | هذا هو الاستخدام الأساسي للفصل. |
| أصل تم شراؤه من مورد واستلامه فأُنشئ كأصل | نعم | يمكن إنشاء عقد ضمان تلقائيًا إذا وجدت coverage مطابقة. |
| إصلاح أصل داخلي بأمر عمل صيانة | نعم | يمكن فحص الضمان أثناء التنفيذ وإنشاء مطالبة. |
| Customer Assets المباعة عبر Sales Order | لا في نطاق هذا الفصل | ضمان الخدمات غالبًا يعالج في subscription/service processes. |
| Depot Repair / Field Service / Service Logistics | خارج نطاق هذا الحل في الفصل | الفصل يركز على Enterprise Assets داخل الصيانة. |
| ضمان قطعة منفردة Piece Part بعد انتهاء ضمان الأصل الأعلى | غير مغطى حاليًا | الفصل يوضح أن الحل يركز على ضمان الأصل الأعلى أو أصول ضمن hierarchy. |

---

## 3. الكيانات الرئيسية في الدومين

| الكيان | الوصف |
|---|---|
| Warranty Provider | المورد أو OEM الذي يقدّم الضمان ويستقبل المطالبات. |
| Warranty Labor Reimbursement Rate | سعر ساعة العمل القابل للتعويض حسب مورد الضمان والعملة والفترة. |
| Warranty Standard Repair Time | عدد ساعات إصلاح قياسية لعملية صيانة قياسية لدى مورد ضمان. |
| Warranty Coverage | قالب ضمان reusable يحدد شروط الضمان ومدته والأصناف والعدادات وأكواد الإصلاح. |
| Coverage Covered Item | صنف ومورد اختياري يستخدم لإنشاء عقود ضمان تلقائيًا عند شراء واستلام الأصل. |
| Coverage Meter Interval | عداد وفاصل استخدام لتحديد انتهاء الضمان ديناميكيًا. |
| Coverage Repair Transaction Code | كود يحدد النظام/التجميعة/المكوّن covered by warranty. |
| Warranty Contract | عقد ضمان فعلي لأصل محدد مستنسخ من coverage. |
| Contract Meter | عداد مرتبط بعقد ضمان لحساب تاريخ انتهاء متوقع. |
| Warranty Repair Indicator | مؤشر في أمر العمل يحدد هل سيتم تقييم الأمر كإصلاح ضمان. |
| Match Transaction Codes | مؤشر يحدد هل يجب مطابقة أكواد الإصلاح أثناء إنشاء الاستحقاقات والمطالبات. |
| Warranty Entitlement | استحقاق تعويض لنفقة مادة أو مورد أو معدات أو إصلاح قياسي. |
| Warranty Claim | مطالبة تعويض ترسل لمورد الضمان وتتضمن entitlement واحدًا أو أكثر. |
| Claim Adjustment | تعديل يدوي على مبلغ المطالبة. |
| Claim Status | حالة المطالبة، مثل Pending Review / Submitted / Resolved أو حالات مخصصة. |

---

## 4. المتطلبات المسبقة

قبل بناء أو تشغيل Supplier Warranty، يجب أن تدعم المنظومة الإعدادات التالية:

| المتطلب | السبب |
|---|---|
| Product Information / Items | الأصناف المستخدمة لإنشاء الأصول يجب أن تكون قابلة للتتبع والصيانة والشراء. |
| Suppliers | يجب تعريف المورد الذي يبيع الصنف والمورد/المصنع الذي يقدم الضمان. |
| Manufacturer / OEM | اختياري، لكن مفيد عندما يكون الضمان من OEM وليس من مورد الشراء. |
| Coverage Types | lookup لتصنيف الضمان: New Purchase, Extended Warranty, OEM Warranty. |
| Asset Smart Search | مطلوب عند إنشاء عقد يدوي لاختيار الأصل. |
| Meter Templates + Asset Meters | مطلوبة إذا كان الضمان ينتهي حسب ساعات/مسافة/قراءة عداد. |
| Daily Utilization Rate | ضروري لحساب تاريخ انتهاء العقد المستقبلي عند استخدام meter intervals. |
| Condition Event Codes | مطلوبة إذا ستستخدم Repair Transaction Codes لتحديد ما هو covered. |
| Standard Operations | اختيارية، لكنها مهمة إذا ستستخدم Standard Repair Times. |
| Cost Accounting | مطلوب لحساب تكاليف العمل والمواد والموارد كأساس للمطالبة. |
| Work Orders + Execution Transactions | المصدر العملي للمصاريف التي تتحول إلى entitlements. |
| Scheduled Jobs | مطلوبة لتحديث العقود وإنشاء المطالبات والاستحقاقات. |

---

## 5. الصلاحيات

الفصل يميز بين صلاحيتين رئيسيتين:

| الصلاحية | الاستخدام |
|---|---|
| Manage Supplier Warranty Duty | إنشاء وتعديل وإدارة coverages, contracts, claims, rates, standard repair times. |
| View Supplier Warranty Duty | عرض بيانات الضمان فقط بدون تعديل. |

في برنامجك يمكن تحويلها إلى صلاحيات RBAC:

| الوظيفة | Maintenance Manager | Maintenance Technician | Asset Administrator | Finance/Claims User |
|---|---:|---:|---:|---:|
| عرض ضمان الأصل | نعم | نعم | نعم | نعم |
| إنشاء Coverage | نعم | لا | نعم | لا |
| تعديل Coverage | نعم | لا | نعم | لا |
| إنشاء Contract | نعم | لا | نعم | محدود |
| تعديل Contract | نعم | لا | نعم | محدود |
| عرض Warranty tab في Work Order | نعم | نعم | نعم | نعم |
| تعديل Warranty Repair checkbox | نعم | محدود | لا | لا |
| إنشاء Claims | نعم | لا | لا | نعم |
| تعديل Claims | نعم | لا | لا | نعم |
| إنشاء Entitlements يدويًا | نعم | لا | لا | نعم |
| إدارة Labor Rates | نعم | لا | لا | نعم |
| إدارة Standard Repair Times | نعم | لا | نعم | لا |
| تشغيل scheduled jobs | نعم | لا | نعم | نعم حسب الدور |

---

## 6. Labor Reimbursement Rates / معدلات تعويض العمالة

هذه الشاشة تدير سعر ساعة العمل القابل للتعويض من مورد الضمان. السعر يستخدم لاحقًا عند حساب entitlement للموارد بدل الاعتماد دائمًا على cost rate الداخلي.

### 6.1 شاشة Manage Labor Reimbursement Rates

| عنصر الشاشة | المطلوب |
|---|---|
| Search bar | البحث باسم مورد الضمان أو رقمه. |
| Results table | عرض active/all/inactive rates. |
| Create Labor Rate | إضافة صف جديد. |
| Inline edit | تعديل السعر أو التواريخ. |

### 6.2 حقول Labor Rate

| الحقل | مطلوب | الوصف |
|---|---:|---|
| warranty_provider_id | نعم | مورد الضمان. |
| provider_number | قراءة | رقم المورد. |
| currency_code | نعم | عملة التعويض. |
| hourly_rate | نعم | سعر الساعة. |
| submission_due_in_days | لا | عدد الأيام المسموحة لتقديم المطالبة. |
| start_date | نعم | بداية سريان السعر. |
| end_date | لا | نهاية سريان السعر. |
| status | نعم | Active / Inactive. |

### 6.3 قواعد مهمة

| القاعدة | التطبيق |
|---|---|
| يجب أن يكون تاريخ rate <= contract start date | لأن عملية claim تبحث عن السعر بناءً على بداية العقد. |
| دعم rates بتاريخ سابق | مطلوب إذا لديك عقود تبدأ في الماضي. |
| منع التداخل لنفس provider + currency | حتى لا توجد أكثر من قيمة سارية لنفس الفترة. |
| إذا لم يوجد عقد أو rate مطابق | يستخدم النظام standard resource cost rate. |

---

## 7. Standard Repair Times / أزمنة الإصلاح القياسية

هذه الشاشة تدير عدد ساعات العمل القابلة للتعويض عندما تكتمل عملية قياسية تحت الضمان.

### 7.1 حقول Standard Repair Time

| الحقل | مطلوب | الوصف |
|---|---:|---|
| warranty_provider_id | نعم | مورد الضمان. |
| organization_id | نعم | منظمة الصيانة. |
| standard_operation_id | نعم | العملية القياسية. |
| repair_time_hours | نعم | عدد الساعات القابلة للتعويض. |
| start_date | نعم | بداية السريان. |
| end_date | لا | نهاية السريان. |
| status | نعم | Active / Inactive. |

### 7.2 الاستخدام في claims

إذا وجد contract مطابق وstandard repair time مطابق لمورد الضمان والعملية، يمكن إنشاء entitlement من نوع `STANDARD_REPAIR` يمثل labor quantity القياسية. عندها قد تُنشأ entitlement قياسية للعميلة بدل إدراج resource entitlements الفعلية داخل claim.

---

## 8. Warranty Coverages / قوالب الضمان

**Coverage** هو قالب reusable يصف شروط الضمان التي يمنحها المورد أو OEM. بعد أن يصبح القالب جاهزًا، يستخدم لإنشاء عقد ضمان فعلي لأصل معين.

```text
Warranty Coverage Template
    ├── Header / Essentials
    ├── Terms of Service
    ├── Covered Items and Suppliers
    ├── Utilization Meter Intervals
    └── Repair Transaction Codes
```

### 8.1 كيف تنتهي فترة الضمان؟

| الطريقة | الوصف |
|---|---|
| Duration | مدة زمنية، مثل 12 شهرًا أو 5 سنوات. |
| Meter Interval | استخدام عداد، مثل 100,000 km أو 5,000 hours. |
| Duration + Meter | يستخدم النظام التاريخ الأقرب انتهاءً. |

إذا احتوى القالب على duration، فإن العقد الناتج يحصل على `end_date = start_date + duration`. وإذا احتوى على meter intervals، يحسب النظام `calculated_expiration_date` بناءً على قراءة العداد ومعدل الاستخدام اليومي. وإذا وجدت الطريقتان، ينتهي العقد حسب whichever comes first.

---

## 9. Manage Coverages UI

### 9.1 البحث والإدارة

| الوظيفة | الوصف |
|---|---|
| البحث | بالاسم، الكود، الوصف، النوع، أو warranty provider. |
| النتائج | تظهر مرتبة أبجديًا حسب coverage name. |
| Create Coverage | فتح guided process لإنشاء قالب جديد. |
| فتح Coverage | الضغط على الاسم لعرض أو تعديل الخطوات. |
| صلاحية view-only | يسمح بالبحث والعرض فقط بدون تعديل. |

### 9.2 خطوات إنشاء Coverage

```text
Step 1: Coverage Essentials       Required
Step 2: Terms of Service          Optional
Step 3: Covered Items             Optional
Step 4: Utilization Meters        Optional
Step 5: Repair Transaction Codes  Optional
```

---

## 10. Step 1 — Coverage Essentials

| الحقل | مطلوب | القاعدة |
|---|---:|---|
| Coverage Name | نعم | يمكن تكرار الاسم، لكن الكود فريد. |
| Coverage Code | نعم | فريد، alphanumeric، uppercase، ويمكن استخدام `_`. لا يتغير بعد الإنشاء. |
| Coverage Description | لا | وصف القالب. |
| Coverage Status | نعم | يبدأ Draft، ولا يستخدم لإنشاء contracts إلا إذا Ready. |
| Start Date | نعم | يمكن أن يكون في الماضي أو الحاضر أو المستقبل، ويجب أن يكون <= end date. |
| End Date | لا | يمنع استخدام القالب لإنشاء عقود جديدة بعد التاريخ. |
| Warranty Duration | لا | قيمة زمنية لحساب contract end date. |
| Duration UOM | حسب duration | Days / Months / Years. |
| Coverage Type | لا | lookup لتصنيف الضمان. |
| Manufacturer Name | لا | OEM اختياري. |
| Supplier Name | لا | مورد الشراء، وقد يكون نفس provider. |
| Warranty Provider Name | نعم | المورد الذي يقدم الضمان وتقدم له المطالبات. |

### قواعد الحالة

| القاعدة | التطبيق |
|---|---|
| Draft عند الإنشاء | لا ينشئ contracts. |
| Ready يحتاج Duration أو Meter أو الاثنين | لأن العقد يحتاج طريقة انتهاء. |
| لا يمكن الرجوع من Ready إلى Draft إذا وُجد contract | حماية العقود الحالية. |
| End date للقالب يمنع عقود جديدة | لكنه لا يغير العقود الموجودة تلقائيًا. |

---

## 11. Step 2 — Terms of Service

هذه الخطوة تحفظ شروط الخدمة ومؤشرات التعويض.

| الحقل/المؤشر | التأثير |
|---|---|
| Requires Repair Authorization | معلومات فقط، تظهر للمستخدم. |
| Labor Reimbursement | إذا Yes، معاملات الموارد والمعدات يمكن أن تصبح entitlements داخل claim. |
| Parts Return Required | معلومات فقط، تفيد في العمل التشغيلي. |
| Allows Internal Repair | معلومات فقط. |
| Parts Reimbursement | إذا Yes، معاملات المواد يمكن أن تصبح entitlements داخل claim. |
| Terms text fields | نصوص حرة لشروط المورد، الاستثناءات، التعليمات، إلخ. |

قاعدة مهمة: إذا كان Labor/Parts reimbursement = No، قد تُنشأ entitlements لكنها لا تدخل تلقائيًا في claim كتعويض.

---

## 12. Step 3 — Covered Items

هذه الخطوة تستخدم عندما تريد إنشاء عقود ضمان تلقائيًا عند شراء واستلام أصل.

| الحقل | مطلوب | الوصف |
|---|---:|---|
| inventory_organization_id | نعم | منظمة الصنف. |
| item_id | نعم | الصنف الذي سيصبح أصلًا. |
| supplier_id | لا | إذا تُرك فارغًا، ينطبق على أي مورد للصنف. |
| auto_create_contract | نعم/لا | هل ينشأ عقد تلقائيًا بعد receipt/asset creation. |
| contract_status_on_creation | نعم إذا auto | Draft أو Ready. |
| enabled | نعم | تعطيل بدل حذف عند وجود contracts. |

### قواعد Covered Items

| القاعدة | التطبيق |
|---|---|
| الصنف يجب أن يكون full life cycle + maintainable + serial controlled + purchasable | حتى يكون مؤهلًا لضمان المورد. |
| يمكن تكرار الصنف فقط إذا اختلف supplier | لمنع تضارب الضمان. |
| إذا وُجد صف عام وصّف خاص للصنف+المورد | يستخدم الصف الخاص. |
| منع duplicate item+supplier عبر active coverages | لتجنب إنشاء عقود ضمان مكررة عند receipt. |

---

## 13. Step 4 — Utilization Meters

هذه الخطوة تعرف فواصل العدادات التي تنهي الضمان عند بلوغ الاستخدام.

| الحقل | مطلوب | الوصف |
|---|---:|---|
| meter_template_id | نعم | عداد مثل odometer أو hour meter. |
| start_value | نعم | 0 للأصول الجديدة، وقيمة أكبر للضمان الممتد. |
| interval_value | نعم | مقدار الضمان، مثل 100000 أو 5000. |
| end_value | محسوب | start_value + interval_value. |
| enabled | نعم | تعطيل بدل حذف عند الحاجة. |

### قاعدة مطابقة العدادات

يجب أن تكون العدادات الموجودة في coverage متوافقة مع asset meters للأصل الذي سيحصل على العقد. إذا لم تطابق العدادات، قد يصبح العقد `Draft` ويتطلب مراجعة يدوية.

---

## 14. Step 5 — Repair Transaction Codes

هذه الخطوة تعرف الأكواد التي تحدد أجزاء/أنظمة الأصل covered by warranty.

| الحقل | الوصف |
|---|---|
| transaction_code_id | condition event code من نوع Transaction Code. |
| code | مثال: 013 أو 013-001 أو 013-001-005. |
| description | مثل Brakes / Front Brakes / Brake Shoe. |
| enabled | تفعيل أو تعطيل. |

### مثال عملي للكود

```text
013             Brakes
013-001         Front Brakes & Drums
013-001-005     Guide - Front Brake Shoe
```

قد يكون كود شديد التفصيل مفيدًا للتقارير لكنه مرهق في ضمانات المورد، لذلك يفضل أحيانًا استخدام مستوى أعلى مثل `013` أو `013-001` لتغطية نظام كامل.

---

## 15. تعديل Coverage موجود

عند تعديل coverage يجب الانتباه لتأثير التعديل على contracts الموجودة.

| نوع التعديل | هل يؤثر على العقود الموجودة؟ |
|---|---:|
| Duration في Step 1 | لا، ينطبق على العقود الجديدة فقط. |
| Covered Items في Step 3 | لا، ينطبق على العقود الجديدة فقط. |
| Meter Intervals في Step 4 | لا، ينطبق على العقود الجديدة فقط. |
| Terms of Service في Step 2 | نعم، يظهر في العقود القائمة باعتبارها مرجعًا. |
| Repair Codes في Step 5 | نعم، تؤثر على تقييم المطالبات للعقود المرتبطة. |

### قواعد تعديل الصفوف

| الحالة | السلوك |
|---|---|
| لا توجد contracts من coverage | يمكن تعديل أو حذف rows في steps 3/4/5. |
| توجد contracts | لا تحذف rows؛ استخدم disable. |
| row disabled | لا يمكن تفعيله مرة أخرى؛ يمكن إنشاء صف جديد مشابه. |
| تغييرات جذرية في الشروط | الأفضل end-date coverage وإنشاء coverage جديد. |

---

## 16. نماذج Coverage Modeling

| السيناريو | النموذج المقترح |
|---|---|
| مورد يقدم ضمان سنة لكل catalog في 2023 | Coverage واحد للمورد، مع end date عند انتهاء catalog. |
| مورد يقدم 1/2/3 سنوات حسب الصنف | عدة coverages لنفس المورد حسب الصنف وفترة الضمان. |
| OEM يقدم ضمانًا عبر عدة موزعين | Coverage باسم OEM كـ warranty provider، وقد لا تحدد supplier. |
| منتج كامل فيه مكونات بضمانات مختلفة | عقد للـ top-level asset، وعقود منفصلة للمكونات المهمة كـ child assets. |
| ضمان 5 سنوات أو 5000 ساعة أو 100000 ميل | Coverage يحتوي duration + meter intervals، وينتهي العقد بالأقرب. |
| أنظمة مختلفة داخل أصل واحد لها ضمانات مختلفة | عدة coverages مع repair transaction codes لتحديد النظام covered. |
| Parent/Child assets لكل نظام | عقود على parent وchild حسب مستوى التتبع، وتقييم claim عبر hierarchy. |

---

## 17. Warranty Contracts / عقود الضمان

**Warranty Contract** هو عقد فعلي لأصل محدد مبني على Coverage. يمكن إنشاؤه يدويًا لأصل موجود، أو تلقائيًا بعد استلام صنف مؤهل وإنشاء الأصل.

```text
Coverage Ready
    ↓
Select Asset + Coverage + Start Date
    ↓
Create Contract
    ↓
Calculate End Date and/or Calculated Expiration Date
    ↓
Ready / Draft / Expired
```

---

## 18. Manage Contracts UI

| الوظيفة | الوصف |
|---|---|
| البحث | contract number, coverage name, asset number, warranty provider. |
| Create Contract | يفتح drawer لإنشاء عقد جديد. |
| فتح contract | يفتح guided process للمراجعة والتعديل. |
| Process Supplier Warranty Contracts job | تحديث تواريخ الانتهاء والحالة وإنشاء عقود شراء جديدة وإثراء الأصول ببيانات الضمان. |

### حقول إنشاء Contract

| الحقل | مطلوب | الوصف |
|---|---:|---|
| Asset Number | نعم | يستخدم asset smart search. |
| Coverage Name | نعم | يستخدم warranty coverage REST/API search ويحتاج 3 أحرف للبحث. |
| Start Date | نعم | بداية التغطية؛ تستخدم لحساب end date. |
| Status | نعم | Draft أو Ready. بعد Ready لا يعود إلى Draft. |
| External Reference Number | لا | مثل رقم أمر الشراء. |
| Contract Notes | لا | ملاحظات العقد. |

---

## 19. Contract Guided Process

```text
Step 1: Contract Essentials            Editable
Step 2: Contract Meters                Editable
Step 3: Coverage Essentials            Reference only
Step 4: Terms of Service               Reference only
Step 5: Repair Transaction Codes       Reference only
```

### 19.1 Contract Essentials

| الحقل | قابل للتعديل | الوصف |
|---|---:|---|
| Contract Number | لا | رقم مولد من النظام. |
| Status | نعم | Draft / Ready / Expired. |
| Asset Number | لا | الأصل المرتبط. |
| Serial Number | لا | رقم تسلسلي إن وجد. |
| Coverage Name | لا | coverage المصدر. |
| Start Date | نعم | يمكن تحديثه. |
| End Date | نعم | تاريخ انتهاء حسب duration. |
| Calculated Expiration Date | نعم/محسوب | تاريخ انتهاء حسب meter intervals. |
| External Reference Number | نعم | مرجع خارجي. |
| Contract Notes | نعم | ملاحظات. |

### 19.2 حالة العقد

| الحالة | المعنى |
|---|---|
| Draft | يحتاج مراجعة أو بيانات غير مطابقة. |
| Ready | عقد فعال يمكن استخدامه في أوامر العمل والمطالبات. |
| Expired | انتهى حسب end date أو calculated expiration date. |

إذا تم تعديل end date أو meter interval إلى تاريخ مستقبلي، يمكن أن يعود العقد من Expired إلى Ready عند الحفظ.

---

## 20. حساب Calculated Expiration Date للعقد

عند وجود Contract Meters، يحسب النظام تاريخ الانتهاء المتوقع باستخدام قراءة العداد ومعدل الاستخدام.

```text
Contract Meter End Value = meter_start_value + meter_interval_value
Days Until Expiration = (Contract Meter End Value - Meter Reading Life-to-Date) / Daily Utilization Rate
Calculated Expiration Date = Today + floor(Days Until Expiration)
```

### مثال

| القيمة | المثال |
|---|---:|
| Contract Meter End Value | 100,000 |
| Meter Reading Life-to-Date | 66,000 |
| Daily Utilization Rate | 300/day |
| Days Until Expiration | 113.33 |
| Calculated Expiration Date | Today + 113 days |

إذا كانت الأيام سالبة، فالعداد انتهى فعليًا. وإذا كان للعقد أكثر من meter، يستخدم النظام أول تاريخ انتهاء.

---

## 21. إنشاء عقود الضمان تلقائيًا أثناء الشراء

عند شراء صنف asset-tracked واستلامه، ينشأ الأصل. بعد ذلك يمكن تشغيل scheduled process يبحث عن coverages مطابقة للصنف والمورد. إذا وجدت تغطية مطابقة، ينشئ النظام contracts للأصل بالحالة المحددة في covered item row.

```text
Purchase Order Receipt
    ↓
Asset Creation
    ↓
Asset Meters Association
    ↓
Process Supplier Warranty Contracts - Additions and Changes
    ↓
Find Matching Coverage by Item/Supplier
    ↓
Create Warranty Contract(s)
```

---

## 22. Supplier Warranty في Work Orders

أثناء إدارة أو تنفيذ أمر العمل، يجب أن تظهر معلومات الضمان في عدة أماكن.

| واجهة | المطلوب |
|---|---|
| Manage Maintenance Work Orders | عمود Warranty يظهر icon إذا كان أصل الأمر أو أصل مرتبط في hierarchy لديه عقد فعال. |
| Edit Work Order > Supplier Warranty tab | يعرض عقود الضمان الفعالة للأصل وأصوله المرتبطة. |
| Edit Work Order > General Overview | يحتوي Warranty Repair checkbox وMatch Transaction Codes checkbox. |
| Work Order Operation Header | حقول Reason for Repair, Repair Transaction Code, Work Accomplished. |
| Operation Item | حقل Repair Transaction Code. |
| Operation Resource | حقول Reason/Repair/Work Accomplished. |
| Dispatch List | يظهر Warranty icon ويدخل لتفاصيل الأمر. |
| Report Resource Transactions | يسمح بتسجيل repair transaction code. |
| Report Material Transactions | يسمح بتسجيل repair transaction code، خصوصًا عند وجود hierarchy viewer. |

### قاعدة مهمة

ظهور Warranty icon لا يعني أن الإصلاح مضمون نهائيًا؛ هو يدل فقط على وجود عقد ضمان فعال للأصل أو أحد الأصول المرتبطة. القرار النهائي يعتمد على نوع الإصلاح، الشروط، الأكواد، وحالة warranty repair في أمر العمل.

---

## 23. Warranty Repair Indicator

عند إنشاء أمر عمل، إذا وُجدت عقود ضمان فعالة للأصل أو related assets، يمكن تعيين `warranty_repair = true` تلقائيًا. لكن يمكن التحكم في السلوك حسب work order type/subtype.

| القاعدة | التطبيق |
|---|---|
| افتراضيًا يتم تقييم الضمان عند وجود contracts | قد يصبح warranty_repair = Yes. |
| بعض أنواع أوامر العمل لا يجب أن تكون ضمانًا | مثل preventive maintenance الناتجة من forecast. |
| يمكن تعريف combinations تجعل default warranty repair = No | في asset maintenance parameters. |
| يمكن تعديل checkbox يدويًا قبل إنشاء claim | يعطي مرونة بعد مراجعة نطاق العمل. |
| إذا checkbox = No | لا تنشئ scheduled process claims/entitlements تلقائيًا. |

---

## 24. Match Transaction Codes

إذا كان للعقود الفعالة coverages تحتوي repair transaction codes، يتم ضبط `match_transaction_codes = true` على أمر العمل. عندها لا تعتبر المعاملة covered إلا إذا طابق كود المعاملة كودًا في coverage.

| الحالة | السلوك |
|---|---|
| Match Transaction Codes = Yes | يتحقق النظام من تطابق code في material/resource/equipment transaction مع coverage. |
| يوجد match | ينشأ entitlement مرتبط بأول contract انتهاءً ويدخل في claim حسب provider. |
| لا يوجد match | ينشأ entitlement غير مرتبط بعقد، ويستبعد من claim. |
| Match Transaction Codes = No | لا تستخدم الأكواد للتحقق؛ يعتمد على وجود عقد فعال ويختار earliest expiring contract. |
| لا يوجد عقد فعال | لا تنشأ entitlements ولا claims تلقائيًا. |

---

## 25. Warranty Claims and Entitlements

**Warranty Claim** هو طلب تعويض للمورد عن تكاليف إصلاح أصل تحت الضمان. المطالبة تنشأ غالبًا بواسطة scheduled process بعد تنفيذ أمر العمل واكتمال التكلفة، ويمكن إنشاؤها يدويًا لتقسيم claim أو معالجة حالات خاصة.

**Warranty Entitlement** يمثل نفقة قابلة أو غير قابلة للتعويض ناتجة من:

| نوع entitlement | المصدر |
|---|---|
| Material Issue | صرف مادة لأمر العمل. |
| Material Return | إرجاع مادة. |
| Resource Charge | وقت مورد بشري. |
| Resource Reversal | عكس مورد. |
| Equipment Charge | استخدام معدات. |
| Equipment Reversal | عكس معدات. |
| Standard Repair | إصلاح قياسي مبني على standard operation + repair time. |
| Other | إدخال يدوي أو حالة خاصة. |

---

## 26. Generate Supplier Warranty Entitlements Scheduled Process

يفضل تشغيل العملية بعد إكمال العمليات وأوامر العمل وبعد costing.

```text
Completed / Costed Work Order
    ↓
Check warranty_repair flag
    ↓
Find active contracts for asset and related assets
    ↓
Evaluate labor/parts reimbursement indicators
    ↓
Evaluate repair transaction codes if enabled
    ↓
Create or update entitlements
    ↓
Group reimbursable entitlements into claims by warranty provider
```

### قواعد العملية

| القاعدة | السلوك |
|---|---|
| work_order.warranty_repair = No | لا تنشأ claims أو entitlements تلقائيًا. |
| transaction covered | entitlement مرتبط بعقد ويدخل في claim. |
| transaction not covered | entitlement قد ينشأ لكنه لا يدخل claim. |
| multiple providers | قد تنشأ عدة claims لنفس work order. |
| costing لم يكتمل | يمكن تحديث entitlements لاحقًا بعد costing، لكن الأفضل تشغيل costing أولًا. |
| Labor Reimbursement = No | resource/equipment entitlements لا تدخل claim تلقائيًا. |
| Parts Reimbursement = No | material entitlements لا تدخل claim تلقائيًا. |

---

## 27. Standard Repairs and Costs داخل Claim

عند استخدام standard repair:

```text
Standard Operation Completed
    ↓
Find Warranty Contract
    ↓
Find Standard Repair Time for provider + organization + operation + contract start date
    ↓
Find Labor Rate for provider + contract start date
    ↓
Create Standard Repair Entitlement
```

| الحالة | السلوك |
|---|---|
| Labor Rate موجود | يستخدم hourly_rate بدل resource standard cost. |
| Standard Repair Time موجود | ينشئ entitlement unique حسب operation sequence. |
| لا يوجد Standard Repair Time | لا ينشئ standard repair entitlement، ويستخدم resource entitlements. |
| لا يوجد contract | لا يطابق provider rate ولا repair time. |
| contract start date في الماضي | يجب وجود rates/repair times بتاريخ سابق. |

---

## 28. Manage Claims UI

### 28.1 البحث في المطالبات

| فلتر | الوصف |
|---|---|
| Work Order Number | أمر العمل. |
| Asset Number | الأصل. |
| Warranty Provider | المورد. |
| Claim Number | رقم المطالبة. |
| Claim Type | نوع المطالبة. |

### 28.2 تعديل سريع للـ Claim

| الحقل | الوصف |
|---|---|
| Claim Status | seeded أو custom status. |
| Submit By | تاريخ مستهدف لتقديم المطالبة. |
| Claim Type | نوع مخصص. |
| Assigned To | الشخص المسؤول. |

### 28.3 إنشاء Claim يدوي

| الحقل | مطلوب | الوصف |
|---|---:|---|
| Work Order | نعم | أمر العمل للمطالبة. |
| Warranty Provider | نعم | المورد الذي ستقدم له المطالبة. |
| Claim Status | نعم | الحالة. |
| Submit By | لا | موعد التقديم. |
| Claim Type | لا | نوع المطالبة. |
| Assigned To | لا | المسؤول. |
| Claim Notes | لا | ملاحظات. |

Claims المنشأة تلقائيًا تبدأ عادة بحالة `Pending Review`، ثم تتم مراجعتها وتقديمها للمورد وإغلاقها بعد الحل أو التعويض.

---

## 29. Claim Guided Process

```text
Step 1: Check your claim
Step 2: Claim Essentials
Step 3: Include Entitlements
Step 4: Review Claim Amounts
```

### 29.1 Step 1 — Check your claim

يعرض ملخصًا read-only:

| الحقل | الوصف |
|---|---|
| Claim Amount | مجموع entitlements + adjustments داخل claim. |
| Entitlements to Be Reimbursed | عدد الاستحقاقات الداخلة في التعويض. |
| Warranty Provider | المورد. |
| Claim Status | الحالة. |
| Submit By | موعد التقديم. |
| Asset Number / Serial | الأصل. |
| Organization | منظمة الصيانة. |
| Work Order Number | أمر العمل. |
| Work Order Total Cost | إجمالي تكلفة أمر العمل. |

إذا اختلف Claim Amount عن Work Order Total Cost فهذا يعني أن بعض transactions لم تدخل في claim.

### 29.2 Step 2 — Claim Essentials

| الحقل | قابل للتعديل | الوصف |
|---|---:|---|
| Work Order | محدود | فقط للclaim اليدوي بلا entitlements. |
| Warranty Provider | محدود | فقط للclaim اليدوي بلا entitlements. |
| Start Date | نعم | افتراضيًا تاريخ الإنشاء. |
| Claim Status | نعم | الحالة. |
| Claim Type | نعم | نوع claim. |
| Submit By | نعم | موعد التقديم. |
| Assigned To | نعم | المسؤول. |
| Claim Reference | نعم | مرجع التعويض مثل credit memo. |
| Claim Resolution Date | نعم | تاريخ الحل. |
| Reimbursement Type | نعم | نوع التعويض. |
| Reimbursement Amount | نعم | مبلغ التعويض الفعلي. |
| Claim Notes | نعم | ملاحظات. |

### 29.3 Step 3 — Include Entitlements

يعرض included / excluded / all entitlements. يمكن إدخال أو تعديل reimbursement details.

| الحقل | الوصف |
|---|---|
| Type | material/resource/equipment/standard repair/other. |
| Description | وصف من transaction أو يدوي. |
| Reason for Repair Code | كود سبب الإصلاح. |
| Repair Transaction Code | كود النظام/المكوّن. |
| Work Accomplished Code | كود العمل المنجز. |
| Warranty Contract | عقد الضمان، ويجب أن يطابق provider الخاص بالclaim. |
| Contract Status / Dates | معلومات read-only من العقد. |
| Asset Number | أصل العقد؛ قد يكون child asset. |
| Cost Quantity / UOM / Unit Cost / Total | تكلفة transaction الأصلية read-only. |
| Reimbursement Quantity | كمية التعويض المطلوبة. |
| Reimbursement UOM | وحدة التعويض. |
| Currency | عملة التعويض. |
| Reimbursement Unit Cost | سعر وحدة التعويض. |
| Total Reimbursement Amount | quantity × unit cost. |
| Additional Notes | ملاحظات. |

قاعدة حساب: إذا أدخلت reimbursement details، يجب إدخال quantity وUOM وcurrency وunit cost حتى يحسب total reimbursement amount.

### 29.4 Step 4 — Review Claim Amounts

يعرض totals حسب نوع entitlement والمجموع النهائي. عند إدخال أو إخراج entitlement يعاد حساب المجاميع. يمكن إضافة adjustment سريع على إجمالي claim.

---

## 30. REST API المقترح

### 30.1 Warranty Provider Rates

| API | الوظيفة |
|---|---|
| GET /warranty-provider-rates | البحث عن rates. |
| POST /warranty-provider-rates | إنشاء rate. |
| PATCH /warranty-provider-rates/{id} | تعديل rate. |
| DELETE /warranty-provider-rates/{id} | حذف/تعطيل حسب القيود. |

### 30.2 Standard Repair Times

| API | الوظيفة |
|---|---|
| GET /warranty-standard-repair-times | البحث. |
| POST /warranty-standard-repair-times | إنشاء repair time. |
| PATCH /warranty-standard-repair-times/{id} | تعديل. |
| DELETE /warranty-standard-repair-times/{id} | حذف/تعطيل. |

### 30.3 Coverages

| API | الوظيفة |
|---|---|
| GET /warranty-coverages | البحث عن coverages. |
| POST /warranty-coverages | إنشاء coverage header. |
| GET /warranty-coverages/{id} | عرض coverage كامل. |
| PATCH /warranty-coverages/{id} | تعديل essentials/terms. |
| POST /warranty-coverages/{id}/covered-items | إضافة covered item. |
| PATCH /warranty-coverages/{id}/covered-items/{lineId} | تعديل/تعطيل covered item. |
| DELETE /warranty-coverages/{id}/covered-items/{lineId} | حذف إذا لا توجد contracts. |
| POST /warranty-coverages/{id}/meters | إضافة meter interval. |
| PATCH /warranty-coverages/{id}/meters/{meterLineId} | تعديل/تعطيل meter. |
| POST /warranty-coverages/{id}/repair-codes | إضافة repair transaction code. |
| PATCH /warranty-coverages/{id}/repair-codes/{codeLineId} | تعديل/تعطيل code. |
| POST /warranty-coverage-imports | استيراد coverages. |

### 30.4 Contracts

| API | الوظيفة |
|---|---|
| GET /warranty-contracts | البحث عن contracts. |
| POST /warranty-contracts | إنشاء عقد لأصل من coverage. |
| GET /warranty-contracts/{id} | عرض عقد. |
| PATCH /warranty-contracts/{id} | تعديل essentials. |
| POST /warranty-contracts/{id}/meters | إضافة contract meter. |
| PATCH /warranty-contracts/{id}/meters/{meterId} | تعديل interval/start/end. |
| DELETE /warranty-contracts/{id}/meters/{meterId} | تعطيل contract meter. |
| POST /warranty-contracts/process-additions-changes | تشغيل job تحديث العقود. |

### 30.5 Claims and Entitlements

| API | الوظيفة |
|---|---|
| GET /warranty-claims | البحث عن claims. |
| POST /warranty-claims | إنشاء claim يدوي. |
| GET /warranty-claims/{id} | عرض claim. |
| PATCH /warranty-claims/{id} | تعديل essentials/status. |
| POST /warranty-claims/{id}/entitlements | إضافة entitlement يدوي. |
| PATCH /warranty-entitlements/{id} | تعديل reimbursement أو contract. |
| POST /warranty-entitlements/generate | تشغيل Generate Supplier Warranty Entitlements. |
| POST /warranty-claims/{id}/include-entitlement/{entitlementId} | إدخال entitlement في claim. |
| POST /warranty-claims/{id}/exclude-entitlement/{entitlementId} | إخراج entitlement. |
| GET /work-orders/{id}/warranty | عرض warranty contracts/flags للأمر. |
| PATCH /work-orders/{id}/warranty-flags | تعديل warranty_repair وmatch_transaction_codes. |

---

## 31. الجداول المقترحة

```text
warranty_providers
warranty_provider_rates
warranty_standard_repair_times
warranty_coverages
warranty_coverage_terms
warranty_coverage_items
warranty_coverage_meters
warranty_coverage_repair_codes
warranty_contracts
warranty_contract_meters
warranty_contract_status_history
work_order_warranty_snapshot
warranty_claims
warranty_entitlements
warranty_claim_entitlements
warranty_claim_adjustments
warranty_import_batches
warranty_import_rows
scheduled_job_runs
```

---

## 32. SQL مبدئي للفصل

```sql
CREATE TABLE warranty_provider_rates (
    id UUID PRIMARY KEY,
    warranty_provider_id UUID NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    hourly_rate NUMERIC(18, 6) NOT NULL CHECK (hourly_rate >= 0),
    submission_due_in_days INTEGER CHECK (submission_due_in_days IS NULL OR submission_due_in_days >= 0),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE warranty_standard_repair_times (
    id UUID PRIMARY KEY,
    warranty_provider_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    standard_operation_id UUID NOT NULL,
    repair_time_hours NUMERIC(18, 6) NOT NULL CHECK (repair_time_hours >= 0),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE warranty_coverages (
    id UUID PRIMARY KEY,
    coverage_code VARCHAR(64) NOT NULL UNIQUE,
    coverage_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    start_date DATE NOT NULL,
    end_date DATE,
    duration_value NUMERIC(18, 6),
    duration_uom VARCHAR(32),
    coverage_type VARCHAR(64),
    manufacturer_id UUID,
    supplier_id UUID,
    warranty_provider_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (coverage_code = upper(coverage_code)),
    CHECK (end_date IS NULL OR end_date >= start_date),
    CHECK ((duration_value IS NULL AND duration_uom IS NULL) OR (duration_value IS NOT NULL AND duration_uom IS NOT NULL))
);

CREATE TABLE warranty_coverage_terms (
    coverage_id UUID PRIMARY KEY REFERENCES warranty_coverages(id) ON DELETE CASCADE,
    requires_repair_authorization BOOLEAN NOT NULL DEFAULT FALSE,
    labor_reimbursement BOOLEAN NOT NULL DEFAULT FALSE,
    parts_return_required BOOLEAN NOT NULL DEFAULT FALSE,
    allows_internal_repair BOOLEAN NOT NULL DEFAULT FALSE,
    parts_reimbursement BOOLEAN NOT NULL DEFAULT FALSE,
    terms_text TEXT,
    exclusions_text TEXT,
    reimbursement_instructions TEXT
);

CREATE TABLE warranty_coverage_items (
    id UUID PRIMARY KEY,
    coverage_id UUID NOT NULL REFERENCES warranty_coverages(id) ON DELETE CASCADE,
    inventory_organization_id UUID NOT NULL,
    item_id UUID NOT NULL,
    supplier_id UUID,
    auto_create_contract BOOLEAN NOT NULL DEFAULT FALSE,
    contract_status_on_creation VARCHAR(32) DEFAULT 'DRAFT',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (coverage_id, inventory_organization_id, item_id, supplier_id)
);

CREATE TABLE warranty_coverage_meters (
    id UUID PRIMARY KEY,
    coverage_id UUID NOT NULL REFERENCES warranty_coverages(id) ON DELETE CASCADE,
    meter_template_id UUID NOT NULL,
    meter_start_value NUMERIC(18, 6) NOT NULL DEFAULT 0,
    meter_interval_value NUMERIC(18, 6) NOT NULL CHECK (meter_interval_value > 0),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (coverage_id, meter_template_id)
);

CREATE TABLE warranty_coverage_repair_codes (
    id UUID PRIMARY KEY,
    coverage_id UUID NOT NULL REFERENCES warranty_coverages(id) ON DELETE CASCADE,
    transaction_code_id UUID NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (coverage_id, transaction_code_id)
);

CREATE TABLE warranty_contracts (
    id UUID PRIMARY KEY,
    contract_number VARCHAR(64) NOT NULL UNIQUE,
    asset_id UUID NOT NULL,
    coverage_id UUID NOT NULL REFERENCES warranty_coverages(id),
    warranty_provider_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    start_date DATE NOT NULL,
    end_date DATE,
    calculated_expiration_date DATE,
    external_reference_number VARCHAR(128),
    contract_notes TEXT,
    created_from VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    source_purchase_order_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('DRAFT','READY','EXPIRED','CANCELED','DISABLED')),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE warranty_contract_meters (
    id UUID PRIMARY KEY,
    warranty_contract_id UUID NOT NULL REFERENCES warranty_contracts(id) ON DELETE CASCADE,
    asset_meter_id UUID NOT NULL,
    meter_template_id UUID NOT NULL,
    meter_start_value NUMERIC(18, 6) NOT NULL DEFAULT 0,
    meter_interval_value NUMERIC(18, 6) NOT NULL CHECK (meter_interval_value > 0),
    meter_end_value NUMERIC(18, 6) NOT NULL,
    calculated_expiration_date DATE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (warranty_contract_id, meter_template_id)
);

CREATE TABLE warranty_claims (
    id UUID PRIMARY KEY,
    claim_number VARCHAR(64) NOT NULL UNIQUE,
    work_order_id UUID NOT NULL,
    asset_id UUID,
    warranty_provider_id UUID NOT NULL,
    claim_status VARCHAR(64) NOT NULL DEFAULT 'PENDING_REVIEW',
    claim_type VARCHAR(64),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    submit_by DATE,
    assigned_to UUID,
    claim_reference VARCHAR(128),
    claim_resolution_date DATE,
    reimbursement_type VARCHAR(64),
    reimbursement_amount NUMERIC(18, 6),
    claim_notes TEXT,
    adjustment_amount NUMERIC(18, 6) NOT NULL DEFAULT 0,
    total_claim_amount NUMERIC(18, 6) NOT NULL DEFAULT 0,
    created_from VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED_PROCESS',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warranty_entitlements (
    id UUID PRIMARY KEY,
    work_order_id UUID NOT NULL,
    work_order_operation_id UUID,
    source_transaction_id UUID,
    warranty_contract_id UUID REFERENCES warranty_contracts(id),
    warranty_provider_id UUID,
    entitlement_type VARCHAR(64) NOT NULL,
    description TEXT,
    reason_for_repair_code_id UUID,
    repair_transaction_code_id UUID,
    work_accomplished_code_id UUID,
    covered_by_warranty BOOLEAN NOT NULL DEFAULT FALSE,
    included_in_claim BOOLEAN NOT NULL DEFAULT FALSE,
    cost_quantity NUMERIC(18, 6),
    cost_uom VARCHAR(32),
    cost_currency_code VARCHAR(3),
    unit_cost NUMERIC(18, 6),
    total_cost_amount NUMERIC(18, 6),
    reimbursement_quantity NUMERIC(18, 6),
    reimbursement_uom VARCHAR(32),
    reimbursement_currency_code VARCHAR(3),
    reimbursement_unit_cost NUMERIC(18, 6),
    total_reimbursement_amount NUMERIC(18, 6),
    additional_notes TEXT,
    created_from VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED_PROCESS',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warranty_claim_entitlements (
    id UUID PRIMARY KEY,
    warranty_claim_id UUID NOT NULL REFERENCES warranty_claims(id) ON DELETE CASCADE,
    warranty_entitlement_id UUID NOT NULL REFERENCES warranty_entitlements(id),
    included BOOLEAN NOT NULL DEFAULT TRUE,
    included_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    excluded_at TIMESTAMP,
    UNIQUE (warranty_claim_id, warranty_entitlement_id)
);
```

---

## 33. قواعد التحقق Validation Rules

| القاعدة | رسالة خطأ مقترحة |
|---|---|
| Supplier warranty فقط للأصول المؤسسة المؤهلة | Supplier warranty is only available for eligible enterprise assets. |
| الصنف يجب أن يكون full lifecycle/maintainable/serial/purchasable | Item is not eligible for supplier warranty. |
| Coverage code فريد وبأحرف كبيرة | Coverage code must be unique and uppercase. |
| Ready coverage يحتاج duration أو meter | Define a duration, meter interval, or both before setting coverage to Ready. |
| لا يمكن تحويل Ready إلى Draft بعد إنشاء عقد | Coverage can't move back to Draft after contracts exist. |
| لا يمكن استخدام coverage غير Ready لإنشاء contract | Only Ready coverages can create warranty contracts. |
| لا يمكن حذف coverage line بعد إنشاء contract | Coverage line is used by contracts and can only be disabled. |
| duplicate item/supplier عبر active coverages ممنوع | Active coverage already exists for this item and supplier. |
| Contract Ready لا يعود Draft | Contract can't move back to Draft after Ready. |
| meter في coverage يجب أن يطابق asset meter للعقد | Contract meter doesn't match asset meters. Review contract. |
| calculated expiration يستخدم أول meter ينتهي | Earliest calculated expiration date must be used. |
| Warranty Repair = No يمنع الإنشاء التلقائي للمطالبات | Work order isn't marked as warranty repair. |
| Match Transaction Codes = Yes يحتاج code مطابق | No matching warranty repair transaction code found. |
| entitlement contract provider يجب أن يطابق claim provider | Entitlement contract provider doesn't match claim provider. |
| reimbursement details يجب أن تكون كاملة | Quantity, UOM, currency, and unit cost are required. |
| labor rate start date يجب أن يسبق أو يساوي contract start | Labor rate must be effective on or before contract start date. |
| standard repair time start date يجب أن يسبق أو يساوي contract start | Standard repair time must be effective on or before contract start date. |
| لا يمكن تعديل work order/provider للclaim إذا لديه entitlements | Claim work order and provider are read-only after entitlements exist. |

---

## 34. Scheduled Jobs المطلوبة

| Job | الوظيفة |
|---|---|
| Process Supplier Warranty Contracts - Additions and Changes | تحديث calculated expiration، تغيير status إلى Expired/Ready، إنشاء contracts للأصول المشتراة، إثراء بيانات الأصل للعرض في التنفيذ. |
| Generate Supplier Warranty Entitlements | إنشاء entitlements وclaims بناءً على work order transactions. |
| Transfer Transactions to Costing | قبل claims أو بعدها لتوفير تكلفة transactions. |
| Import Warranty Coverages | استيراد coverages بالجملة. |
| Purge Maintenance Records from Interface | حذف بيانات interface الفاشلة أو التي بها warnings/errors. |

---

## 35. التكاملات المطلوبة

| النظام | التكامل |
|---|---|
| Assets | contract لكل أصل، وحساب related assets داخل physical hierarchy. |
| Items / PIM | الأهلية، covered items، repair codes على item. |
| Suppliers | provider, purchasing supplier, OEM. |
| Purchasing / Receiving | إنشاء أصل ثم contract تلقائي. |
| Meters | حساب calculated expiration date. |
| Standard Operations | repair codes وstandard repair times. |
| Work Orders | flags, warranty tab, operation/item/resource codes. |
| Execution Transactions | material/resource/equipment costs تتحول إلى entitlements. |
| Costing | تكلفة العمل كأساس reimbursement. |
| Imports / FBDI | import coverages وتنظيف interface. |
| REST API | إدارة coverages/contracts/claims/entitlements/rates. |

---

## 36. سير العمل الكامل

### 36.1 إعداد ضمان مورد جديد

1. تعريف المورد أو OEM.
2. تعريف الأصناف المؤهلة.
3. تعريف meter templates وربطها بالأصول إذا كان الضمان حسب الاستخدام.
4. تعريف condition event codes إذا كان الضمان حسب النظام/المكوّن.
5. تعريف standard operations إذا ستستخدم standard repair times.
6. تعريف labor reimbursement rates.
7. تعريف standard repair times.
8. إنشاء warranty coverage.
9. إدخال essentials، terms، covered items، meters، repair codes.
10. جعل coverage = Ready.
11. إنشاء contract يدويًا أو تلقائيًا عند الشراء.
12. تشغيل Process Supplier Warranty Contracts دوريًا.

### 36.2 إنشاء مطالبة ضمان من أمر عمل

1. إنشاء work order لأصل لديه active contract.
2. يظهر Warranty icon أو يتم ضبط warranty_repair = Yes.
3. مراجعة Supplier Warranty tab.
4. مراجعة Match Transaction Codes إذا كانت coverages تستخدم repair codes.
5. تنفيذ operations.
6. تسجيل material/resource/equipment transactions.
7. تشغيل costing.
8. تشغيل Generate Supplier Warranty Entitlements.
9. النظام ينشئ entitlements.
10. النظام يجمع entitlements القابلة للتعويض في claims حسب warranty provider.
11. المستخدم يراجع claim.
12. المستخدم يعدل entitlements أو reimbursement amounts إذا لزم.
13. المستخدم يرسل claim للمورد.
14. تسجيل reimbursement reference/resolution.
15. إغلاق claim.

---

## 37. Backlog تنفيذي للفصل 6

| الأولوية | المهمة |
|---|---|
| P0 | إنشاء جداول warranty_coverages وwarranty_contracts وwarranty_claims وwarranty_entitlements. |
| P0 | بناء service لإنشاء coverage وتغيير حالته إلى Ready حسب duration/meter. |
| P0 | بناء service لإنشاء contract يدويًا لأصل. |
| P0 | حساب end_date وcalculated_expiration_date. |
| P0 | إظهار Supplier Warranty tab في work order. |
| P0 | إضافة warranty_repair وmatch_transaction_codes إلى work orders. |
| P1 | provider labor rates. |
| P1 | standard repair times. |
| P1 | covered items + auto contract creation placeholders. |
| P1 | repair transaction codes وربطها بالعمليات والمواد والموارد. |
| P1 | scheduled job لتحديث العقود. |
| P1 | scheduled job لإنشاء entitlements وclaims. |
| P2 | Manage Claims UI كامل. |
| P2 | Include/Exclude entitlements وحساب claim totals. |
| P2 | claim adjustments. |
| P2 | REST APIs كاملة. |
| P2 | import warranty coverages. |
| P3 | قواعد متقدمة لمنع التداخل في coverages/rates. |
| P3 | تكامل مفصل مع Purchasing/Receiving. |
| P3 | تقارير وتحليلات warranty recovery. |

---

## 38. ملاحظات تنفيذية لـ Cursor

عند إضافة هذا الفصل إلى مشروع قائم:

1. لا تبدأ بالواجهة؛ ابدأ بالدومين والجداول.
2. اربط warranty_contracts بجدول assets الموجود من الفصل 3.
3. اربط contract meters بجداول asset_meters من الفصل 5.
4. اربط entitlements بجداول work_orders/work_order_operations لاحقًا في الفصل 11/13.
5. إذا لم تكن وحدة work orders مكتملة بعد، أضف placeholders أو foreign keys اختيارية.
6. اجعل scheduled jobs قابلة للتشغيل يدويًا في البداية.
7. لا تجعل Warranty icon يعني أن claim مضمون؛ هو فقط indicator لوجود active contract.
8. اعتمد على status machines واضحة لـ Coverage وContract وClaim.

---

## 39. خلاصة الفصل

الفصل السادس يضيف طبقة مالية/تشغيلية مهمة فوق الأصول وأوامر العمل. المطلوب هو تتبع الضمان من القالب إلى العقد ثم إلى أمر العمل ثم إلى الاستحقاق والمطالبة. القيمة العملية للوحدة أنها تمنع ضياع حقوق التعويض من المورد، وتساعد الفني والمدير على اتخاذ قرار إصلاح صحيح، ثم تحول تكاليف المواد والموارد إلى مطالبات يمكن تتبعها حتى التعويض.


---

# الفصل 7 — Maintenance Standard Operations / عمليات الصيانة القياسية

## 1. نطاق الفصل

هذا الفصل يضيف إلى نظام الصيانة مكتبة **عمليات قياسية Standard Operations**. العملية القياسية هي قالب قابل لإعادة الاستخدام يصف خطوة صيانة أو إصلاح، مع مركز العمل، الموارد المطلوبة، تعليمات أو مرفقات، وسلوك التنفيذ مثل `Count Point` أو `Automatically Transact`.

الغرض من هذه الوحدة هو منع تكرار إدخال نفس تفاصيل العملية في كل قالب صيانة أو أمر عمل، وتقليل أخطاء الإدخال، وتوحيد طريقة تنفيذ الأعمال المتكررة مثل الفحص، التشحيم، الاستبدال، الاختبار، أو عملية مورد خارجي.

```text
Maintenance Standard Operation
    ├── Operation Header
    ├── Work Center
    ├── Execution Controls
    ├── Supplier Operation Details, if Supplier
    ├── Resources, if In-House
    ├── Alternate Resources
    ├── Attachments / Work Instructions
    ├── Repair Coding for Warranty / Analytics
    └── Flexfields / Custom Fields
```

---

## 2. أين تستخدم Standard Operations؟

| الاستخدام | السلوك |
|---|---|
| Maintenance Work Definition | يمكن إضافة العملية القياسية كـ reference أو copy. |
| Maintenance Work Order | يمكن إضافة العملية القياسية، لكنها تكون copy دائمًا داخل أمر العمل. |
| REST API | يمكن إنشاء أو تحديث standard operations، ويمكن استخدامها عند إنشاء تعريفات العمل أو أوامر العمل. |
| FBDI / Import | يمكن الرجوع إلى standard operation عند تحميل work definitions أو work orders. |
| ADFdi Spreadsheet | يمكن إنشاء وتحديث العمليات والموارد والموارد البديلة جماعيًا. |
| Supplier Warranty | أكواد الإصلاح المحفوظة على العملية تنتقل إلى أمر العمل وتستخدم لاحقًا في claims وentitlements. |

---

## 3. الفائدة البرمجية من الوحدة

| الفائدة | التطبيق في برنامجك |
|---|---|
| مكتبة مركزية للعمليات المتكررة | لا يعيد المستخدم كتابة نفس العملية في كل مرة. |
| تقليل أخطاء الإدخال | العملية المعتمدة تُنسخ أو تُربط كما هي. |
| سرعة إنشاء Work Definitions | المستخدم يسحب عملية جاهزة بدل بناء كل التفاصيل يدويًا. |
| سرعة إنشاء Work Orders | العملية تُضاف مباشرة مع الموارد والمرفقات. |
| توحيد إجراءات الصيانة | كل فني يرى نفس الخطوات والموارد والتعليمات. |
| دعم التغيير المركزي | عند استخدام reference داخل work definition، أي تعديل على standard operation ينعكس على التعريف. |
| دعم warranty coding | أكواد السبب، المعاملة، والعمل المنجز تنتقل للتنفيذ والمطالبات. |

---

## 4. الكيانات الرئيسية في الدومين

| الكيان | الوصف |
|---|---|
| Standard Operation | رأس العملية القياسية: الاسم، الكود، النوع، مركز العمل، قواعد التنفيذ. |
| Standard Operation Resource | مورد مطلوب لتنفيذ العملية إذا كانت In-House. |
| Standard Operation Alternate Resource | مورد بديل يمكن استخدامه بدل المورد الأساسي. |
| Standard Operation Attachment | مرفقات العملية مثل ملف تعليمات، نص، أو رابط. |
| Standard Operation Repair Coding | أكواد الإصلاح المستخدمة في الضمان والتحليلات. |
| Standard Operation Flexfields | حقول إضافية قابلة للتخصيص على العملية أو مورد العملية. |
| Standard Operation Usage Reference | تتبع استخدام العملية داخل work definitions أو work orders لمنع حذف أو تعديل غير مسموح. |
| Spreadsheet Batch | دفعة تحميل أو تحديث جماعي عبر spreadsheet. |

---

## 5. أنواع العمليات

| النوع | الوصف | هل يحتوي Resources؟ | هل يحتوي Supplier Details؟ |
|---|---|---:|---:|
| In-House | عملية تنفذ داخل منظمة الصيانة بواسطة الفنيين أو المعدات الداخلية. | نعم | لا |
| Supplier | عملية تنفذ عند مورد خارجي كـ outside processing. | لا | نعم |

قاعدة مهمة: موارد العملية تنطبق فقط على العمليات الداخلية **In-House**. أما عملية المورد **Supplier** فتحتاج بيانات outside processing ولا تُضاف لها موارد داخلية.

---

## 6. شاشة Manage Maintenance Standard Operations

هذه الشاشة هي نقطة البداية لإدارة العمليات القياسية.

### الوظائف المطلوبة

| الوظيفة | الوصف |
|---|---|
| Search | البحث عن العمليات الموجودة. |
| Create | إنشاء عملية قياسية جديدة. |
| Edit | تعديل عملية موجودة. |
| Delete | حذف عملية حسب القيود. |
| Include inactive operations | خيار لإظهار أو إخفاء العمليات غير النشطة. |
| Redwood flag | في Oracle توجد profile option لتفعيل صفحة Redwood، ويمكن تمثيلها في برنامجك كـ feature flag. |

### البحث يجب أن يدعم

| معيار البحث | ملاحظات |
|---|---|
| Name | اسم العملية. |
| Code | كود العملية. |
| Description | وصف العملية. |
| Work Center | مركز العمل. |
| Work Center Code | كود مركز العمل. |
| Supplier information | معلومات المورد إذا كانت العملية من نوع Supplier. |
| Include inactive | عرض العمليات ذات Inactive On ماضٍ أو لا. |

---

## 7. إنشاء Standard Operation

### 7.1 حقول رأس العملية

| الحقل | مطلوب | الوصف |
|---|---:|---|
| organization_id | نعم | منظمة الصيانة التي تنتمي لها العملية. |
| operation_type | نعم | `IN_HOUSE` أو `SUPPLIER`. |
| name | نعم | اسم العملية. |
| code | نعم | كود فريد داخل المنظمة. |
| description | لا | وصف العملية. |
| work_center_id | نعم | مركز العمل، ويجب أن يكون نشطًا. |
| work_center_code | قراءة | يُستمد من مركز العمل. |
| work_center_description | قراءة | يُستمد من مركز العمل. |
| count_point | لا | هل يجب الإبلاغ عن إكمال العملية صراحة؟ |
| automatically_transact | لا | هل تكتمل العملية تلقائيًا عند إكمال count point التالي؟ |
| inactive_on | لا | تاريخ تعطيل العملية. |
| default_for_automatic_work_definition | لا | غير مستخدم للصيانة، اتركه false. |
| additional_manual_material_issue | نعم | Allow أو Do not allow. |
| completions_with_under_issues | نعم | Allow أو Allow with warning أو Do not allow. |
| completions_with_open_exceptions | نعم | Allow أو Allow with warning أو Do not allow. |
| custom_fields | لا | حقول إضافية. |

### 7.2 Count Point مقابل Automatically Transact

| الخيار | المعنى |
|---|---|
| Count Point | العملية تحتاج إكمالًا صريحًا من الفني أثناء التنفيذ. |
| Automatically Transact | العملية تكتمل تلقائيًا، وتُستهلك pull components وتُحمّل الموارد تلقائيًا عند إكمال count point التالي. |
| Optional Operation | إذا لم تكن Count Point ولا Automatically Transact، فهي عملية اختيارية لا تحتاج إجراء تنفيذ مباشر. |

قاعدة تحقق أساسية:

```text
count_point = true  AND automatically_transact = true  => غير مسموح
```

---

## 8. مرفقات العملية

المرفقات يمكن أن تكون:

| النوع | مثال |
|---|---|
| File | PDF تعليمات، صورة، مستند فحص. |
| Text | نص خطوات العمل. |
| URL | رابط فيديو أو صفحة داخلية. |

عند استخدام standard operation في work definition أو work order، تنتقل المرفقات إلى العملية الموروثة. بعد انتقالها تكون غير قابلة للتعديل من المصدر الذي ورثها، وتظهر في تفاصيل كل عملية أثناء التنفيذ.

---

## 9. Supplier Operation Details

إذا كان `operation_type = SUPPLIER`، يجب أن تظهر منطقة خاصة ببيانات المورد الخارجي.

| الحقل | مطلوب | الوصف |
|---|---:|---|
| outside_processing_item_id | نعم | صنف يمثل خدمة القيمة المضافة التي ينفذها المورد. |
| outside_processing_item_description | قراءة | وصف صنف الخدمة. |
| supplier_id | نعم/حسب السياسة | المورد المرتبط بالعملية. |
| supplier_site_id | نعم/حسب السياسة | موقع المورد. |

### قواعد Supplier Operation

| القاعدة | التطبيق |
|---|---|
| لا تضف موارد داخلية | supplier operation لا تحتوي standard_operation_resources. |
| outside processing item ليس component | لا يجوز استخدام صنف خدمة المورد كمادة operation item. |
| يجب تعريف الصنف في Product / Items | لأن الخدمة تمثل outside processing item. |
| إذا كان العمل لاحقًا في Work Order | تعديل outside processing attributes يكون مقيدًا بحالة أمر العمل. |
| supplier operation عادة تكون count point عند التنفيذ | لأنها تمثل خطوة تحتاج تتبع شراء/شحن/استلام. |

---

## 10. Resources للعمليات الداخلية

قسم Resources يظهر فقط عندما تكون العملية **In-House**. المورد يمكن أن يكون Labor أو Equipment تم تعريفه سابقًا وربطه بمركز العمل.

### 10.1 حقول Resource

| الحقل | مطلوب | الوصف |
|---|---:|---|
| sequence | نعم | تسلسل المورد داخل العملية. يمكن تكراره للموارد المتزامنة. |
| resource_id | نعم | المورد، ويجب أن يكون نشطًا ومتاحًا في مركز العمل المحدد. |
| resource_code | قراءة | يُستمد من تعريف المورد. |
| units_assigned | نعم | عدد وحدات المورد المسندة. لا تتجاوز المتاح في work center resource availability. |
| basis | نعم | `FIXED` أو `VARIABLE`. |
| usage | نعم | مقدار استخدام المورد. |
| inverse_usage | قراءة/إدخال | `1 / usage`، ويتزامن مع usage. |
| uom_id | قراءة | وحدة القياس من تعريف المورد. |
| scheduled | لا | هل يدخل المورد في الجدولة؟ |
| principal | لا | المورد الرئيسي ضمن مجموعة موارد متزامنة. |
| charge_type | نعم | `AUTOMATIC` أو `MANUAL`. |
| job_profile_id | لا | مؤهلات مطلوبة لمورد Labor. |
| equipment_profile_id | لا | مؤهلات مطلوبة لمورد Equipment. |
| activity | لا | Setup أو Run أو Tear Down، مع إمكانية توسيع lookup. |
| costing_enabled | قراءة | هل تكلفة المورد تُحمّل على أمر العمل؟ |
| inactive_on | لا | تاريخ تعطيل المورد داخل العملية. |
| attachments | لا | مرفقات للمورد. |
| custom_fields | لا | حقول إضافية لمورد العملية. |

### 10.2 الموارد المتزامنة

إذا تكرر نفس `sequence` لأكثر من مورد، فهذا يعني أن الموارد تعمل بالتوازي. في هذه الحالة يجب أن يكون هناك **Principal Resource واحد فقط** داخل نفس sequence.

```text
Operation: Replace Pump Bearing
    Resource Sequence 10: Mechanic      Principal = Yes
    Resource Sequence 10: Hoist         Principal = No
    Resource Sequence 20: QA Inspector  Principal = Yes
```

### 10.3 usage و inverse usage

```text
inverse_usage = 1 / usage
usage = 1 / inverse_usage
```

إذا أدخل المستخدم `usage` يحسب النظام `inverse_usage`. وإذا أدخل `inverse_usage` يحسب النظام `usage`.

### 10.4 Scheduled Resource

لا يمكن اعتبار المورد scheduled إلا إذا كانت وحدة قياس المورد ضمن فئة وحدات مدة الخدمة في إعدادات النظام، وعادة تكون ساعات أو دقائق. الموارد المجدولة تدخل في حساب مدة وجدولة أوامر العمل لاحقًا.

### 10.5 Job Profile و Equipment Profile

| profile | يستخدم مع | الوصف |
|---|---|---|
| Job Profile | Labor | مجموعة مؤهلات يجب أن يملكها الفني حتى ينفذ العملية. |
| Equipment Profile | Equipment | مجموعة مؤهلات أو خصائص يجب أن تملكها المعدة حتى تستخدم في العملية. |

هذه الحقول مهمة لاحقًا عند الإسناد داخل Supervision أو My Maintenance Work، لأن النظام يستطيع إظهار الفنيين أو المعدات المؤهلة فقط.

---

## 11. Alternate Resources

الموارد البديلة تسمح للنظام أو المستخدم باستبدال مورد أساسي بمورد آخر عند عدم التوفر.

| الحقل | الوصف |
|---|---|
| standard_operation_resource_id | المورد الأساسي. |
| alternate_resource_id | المورد البديل. |
| priority | أولوية البديل. |
| usage | استخدام البديل إذا اختلف عن الأساسي. |
| inverse_usage | عكس الاستخدام. |
| effective_from / effective_to | صلاحية البديل. |

مثال:

```text
Primary Resource: Senior Mechanic
Alternate 1: Mechanic Team A
Alternate 2: External Mechanic Crew
```

---

## 12. Additional Attributes / Repair Coding

يمكن تعريف أكواد إصلاح إضافية على العملية القياسية. هذه الأكواد مهمة للضمان، التقارير، وتحليل الأعطال.

| الكود | المعنى | نوع Condition Event Code |
|---|---|---|
| Reason for Repair Code | لماذا يتم إصلاح الأصل؟ | Reason for repair code |
| Repair Transaction Code | النظام/التجميعة/المكوّن الذي يتم إصلاحه | Transaction code |
| Work to Be Accomplished Code | النشاط المنجز لإصلاح الأصل | Work accomplished code |

أمثلة:

| الكود | أمثلة |
|---|---|
| Reason for Repair | Breakdown, Preventive Maintenance, Warranty |
| Repair Transaction | VMRS أو تصنيف داخلي للنظام/المكوّن |
| Work Accomplished | Clean, Repair, Replace |

قاعدة مهمة: هذه الأكواد لا تظهر داخل Work Definition، لكنها عند إنشاء Work Order تنتقل إلى رأس العملية ومواردها، ويمكن تعديلها اختياريًا في أمر العمل، ثم تنتقل إلى Resource Transactions وWarranty Claims and Entitlements.

---

## 13. تعديل Standard Operation

### ما يمكن تعديله

| الحقل | القاعدة |
|---|---|
| Name | قابل للتعديل. |
| Code | قابل للتعديل فقط إذا لم تُستخدم العملية في Work Definition أو Work Order. |
| Description | قابل للتعديل. |
| Inactive Date | قابل للتعديل. |
| Attachments | قابلة للتعديل. |
| Work Center | لا يمكن تعديله إلا إذا لم توجد Resources مرتبطة بالعملية. |

### قواعد مهمة

| الحالة | السلوك |
|---|---|
| العملية مستخدمة في Work Definition كـ reference | التعديلات المستقبلية تنعكس على Work Definition. |
| العملية مستخدمة في Work Order | أمر العمل يحتفظ بنسخة ولا يتأثر بالتعديلات المستقبلية. |
| تغيير Work Center مع وجود resources | ممنوع لأن الموارد مرتبطة بمركز العمل. |
| تغيير Code بعد الاستخدام | ممنوع لحماية المراجع. |

---

## 14. حذف Standard Operation

لا يمكن حذف العملية القياسية إذا كانت مرجعية أو مستخدمة في أي Work Definition أو Work Order. الأفضل دعم التعطيل باستخدام `inactive_on` بدل الحذف عند وجود استخدامات.

| الحالة | هل يسمح بالحذف؟ |
|---|---:|
| لا توجد أي references | نعم |
| مستخدمة في Work Definition | لا |
| مستخدمة في Work Order | لا |
| مستخدمة فقط في تاريخ قديم | يفضل عدم الحذف، استخدم inactive_on |

---

## 15. Flexfields / الحقول الإضافية

يدعم الفصل الحقول الإضافية على:

| الكائن | الوصف |
|---|---|
| Standard Operation | حقول إضافية على رأس العملية. |
| Standard Operation Resource | حقول إضافية على مورد العملية. |

هذه الكائنات مشتركة بين Manufacturing وMaintenance، لذلك أي flexfields تضيفها قد تظهر في التطبيقين.

### عدد الحقول المتاحة لرأس Standard Operation

| نوع الحقل | العدد |
|---|---:|
| Character | 20 |
| Number | 10 |
| Date | 10 |
| Date and Time | 10 |

في برنامجك، أفضل تمثيل:

```text
standard_operations.custom_fields JSONB
standard_operation_resources.custom_fields JSONB
```

أو:

```text
custom_field_definitions
custom_field_values
```

إذا أردت دعم تحليلات لاحقة، أضف خيار `bi_enabled` لكل تعريف حقل.

---

## 16. REST API

يجب أن تسمح واجهات API بإنشاء وتحديث العمليات القياسية ومواردها.

| API | الوظيفة |
|---|---|
| GET /standard-operations | البحث عن العمليات القياسية. |
| POST /standard-operations | إنشاء عملية قياسية. |
| GET /standard-operations/{id} | عرض عملية قياسية. |
| PATCH /standard-operations/{id} | تعديل رأس العملية حسب القيود. |
| DELETE /standard-operations/{id} | حذف العملية إذا لم تكن مستخدمة. |
| POST /standard-operations/{id}/resources | إضافة مورد لعملية In-House. |
| PATCH /standard-operations/{id}/resources/{resourceLineId} | تعديل مورد العملية. |
| DELETE /standard-operations/{id}/resources/{resourceLineId} | حذف مورد من العملية. |
| POST /standard-operations/{id}/resources/{resourceLineId}/alternates | إضافة مورد بديل. |
| POST /standard-operations/{id}/attachments | إضافة مرفق. |
| PATCH /standard-operations/{id}/repair-codes | تحديث أكواد الإصلاح. |
| GET /standard-operations/{id}/usages | عرض أماكن استخدام العملية. |
| POST /standard-operations/spreadsheet-batches | إنشاء دفعة spreadsheet/import. |

---

## 17. Spreadsheet / ADFdi-style Bulk Management

يجب دعم إدارة جماعية للعمليات القياسية، سواء بملف Excel أو CSV أو واجهة import داخلية.

### Worksheets المطلوبة

| الورقة | المحتوى |
|---|---|
| Standard Operations | رؤوس العمليات. |
| Standard Operations Resources | موارد العمليات. |
| Standard Alternate Resources | الموارد البديلة. |

### قواعد التحميل الجماعي

| القاعدة | التطبيق |
|---|---|
| أنشئ header أولًا | لا يمكن تحميل resource قبل standard operation. |
| ابحث قبل التحديث | يجب تحديد records المطلوب تحديثها بدل blind update. |
| لا ترفع تقريرًا فارغ المعايير | لتجنب سحب كمية بيانات كبيرة بلا داعي. |
| الحقول read-only لا ترفع | مثل resource_code وuom الموروثة. |
| Changed indicator | عند تعديل row يظهر أنها تغيرت. |
| Row Status | يظهر نجاح أو خطأ كل صف بعد upload. |
| DFF validation | عند flexfields في standard operation، قد يتم فقط التحقق من نوع البيانات. |

---

## 18. طريقة استخدام Standard Operation داخل Work Definition وWork Order

### 18.1 Reference داخل Work Definition

عند اختيار `Referenced = true` داخل Work Definition:

| السلوك | النتيجة |
|---|---|
| العملية تبقى مرتبطة بالمكتبة | نعم |
| تعديل standard operation لاحقًا ينعكس | نعم |
| لا يمكن تعديل attributes أو resources داخل work definition | نعم، لأنها تأتي من المصدر |
| مناسب لـ | عمليات مؤسسية موحدة يجب أن تبقى متزامنة |

### 18.2 Copy داخل Work Definition أو Work Order

عند اختيار `Referenced = false`:

| السلوك | النتيجة |
|---|---|
| تنشأ نسخة مستقلة | نعم |
| تعديلات standard operation لاحقًا لا تنعكس | نعم |
| يمكن تعديل العملية والموارد داخل السياق الجديد | نعم |
| الرجوع إلى referenced لاحقًا | غير مسموح بعد override |

### 18.3 Work Order دائمًا copy

في أمر العمل، standard operation تكون دائمًا نسخة. لذلك إذا عدلت العملية القياسية لاحقًا، لا يتغير أمر العمل القديم أو الحالي.

---

## 19. الجداول المقترحة

```text
maintenance_standard_operations
maintenance_standard_operation_resources
maintenance_standard_operation_alternate_resources
maintenance_standard_operation_attachments
maintenance_standard_operation_repair_codes
maintenance_standard_operation_usages
maintenance_standard_operation_import_batches
maintenance_standard_operation_import_rows
```

### 19.1 جدول maintenance_standard_operations

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| organization_id | uuid FK |
| operation_type | enum: IN_HOUSE, SUPPLIER |
| code | varchar |
| name | varchar |
| description | text |
| work_center_id | uuid FK |
| count_point | boolean |
| automatically_transact | boolean |
| inactive_on | date |
| default_for_automatic_work_definition | boolean |
| additional_manual_material_issue | enum: ALLOW, DO_NOT_ALLOW |
| completions_with_under_issues | enum: ALLOW, ALLOW_WITH_WARNING, DO_NOT_ALLOW |
| completions_with_open_exceptions | enum: ALLOW, ALLOW_WITH_WARNING, DO_NOT_ALLOW |
| outside_processing_item_id | uuid nullable |
| supplier_id | uuid nullable |
| supplier_site_id | uuid nullable |
| reason_for_repair_code_id | uuid nullable |
| repair_transaction_code_id | uuid nullable |
| work_accomplished_code_id | uuid nullable |
| custom_fields | jsonb |
| created_at | timestamp |
| updated_at | timestamp |

### 19.2 جدول maintenance_standard_operation_resources

| الحقل | النوع المقترح |
|---|---|
| id | uuid |
| standard_operation_id | uuid FK |
| sequence | integer |
| resource_id | uuid FK |
| units_assigned | numeric |
| basis | enum: FIXED, VARIABLE |
| usage_value | numeric |
| inverse_usage_value | numeric |
| scheduled | boolean |
| principal | boolean |
| charge_type | enum: AUTOMATIC, MANUAL |
| job_profile_id | uuid nullable |
| equipment_profile_id | uuid nullable |
| activity | enum/string |
| inactive_on | date nullable |
| custom_fields | jsonb |

---

## 20. SQL مبدئي

```sql
CREATE TABLE maintenance_standard_operations (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    operation_type VARCHAR(32) NOT NULL CHECK (operation_type IN ('IN_HOUSE', 'SUPPLIER')),
    code VARCHAR(80) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    work_center_id UUID NOT NULL,
    count_point BOOLEAN NOT NULL DEFAULT TRUE,
    automatically_transact BOOLEAN NOT NULL DEFAULT FALSE,
    inactive_on DATE,
    default_for_automatic_work_definition BOOLEAN NOT NULL DEFAULT FALSE,
    additional_manual_material_issue VARCHAR(32) NOT NULL DEFAULT 'ALLOW',
    completions_with_under_issues VARCHAR(32) NOT NULL DEFAULT 'ALLOW_WITH_WARNING',
    completions_with_open_exceptions VARCHAR(32) NOT NULL DEFAULT 'ALLOW_WITH_WARNING',
    outside_processing_item_id UUID,
    supplier_id UUID,
    supplier_site_id UUID,
    reason_for_repair_code_id UUID,
    repair_transaction_code_id UUID,
    work_accomplished_code_id UUID,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, code),
    CHECK (NOT (count_point = TRUE AND automatically_transact = TRUE)),
    CHECK (
        (operation_type = 'IN_HOUSE' AND outside_processing_item_id IS NULL)
        OR
        (operation_type = 'SUPPLIER' AND outside_processing_item_id IS NOT NULL)
    )
);

CREATE TABLE maintenance_standard_operation_resources (
    id UUID PRIMARY KEY,
    standard_operation_id UUID NOT NULL REFERENCES maintenance_standard_operations(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    resource_id UUID NOT NULL,
    units_assigned NUMERIC(18,6) NOT NULL DEFAULT 1,
    basis VARCHAR(32) NOT NULL CHECK (basis IN ('FIXED', 'VARIABLE')),
    usage_value NUMERIC(18,6) NOT NULL,
    inverse_usage_value NUMERIC(18,6),
    scheduled BOOLEAN NOT NULL DEFAULT FALSE,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    charge_type VARCHAR(32) NOT NULL CHECK (charge_type IN ('AUTOMATIC', 'MANUAL')),
    job_profile_id UUID,
    equipment_profile_id UUID,
    activity VARCHAR(64) NOT NULL DEFAULT 'RUN',
    inactive_on DATE,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (standard_operation_id, sequence, resource_id),
    CHECK (usage_value > 0),
    CHECK (units_assigned > 0)
);

CREATE TABLE maintenance_standard_operation_alternate_resources (
    id UUID PRIMARY KEY,
    standard_operation_resource_id UUID NOT NULL REFERENCES maintenance_standard_operation_resources(id) ON DELETE CASCADE,
    alternate_resource_id UUID NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    usage_value NUMERIC(18,6),
    inverse_usage_value NUMERIC(18,6),
    effective_from DATE,
    effective_to DATE,
    UNIQUE (standard_operation_resource_id, alternate_resource_id)
);

CREATE TABLE maintenance_standard_operation_attachments (
    id UUID PRIMARY KEY,
    standard_operation_id UUID NOT NULL REFERENCES maintenance_standard_operations(id) ON DELETE CASCADE,
    resource_line_id UUID REFERENCES maintenance_standard_operation_resources(id) ON DELETE CASCADE,
    attachment_type VARCHAR(32) NOT NULL CHECK (attachment_type IN ('FILE', 'TEXT', 'URL')),
    title VARCHAR(255) NOT NULL,
    content_text TEXT,
    file_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_standard_operation_usages (
    id UUID PRIMARY KEY,
    standard_operation_id UUID NOT NULL REFERENCES maintenance_standard_operations(id),
    usage_type VARCHAR(64) NOT NULL CHECK (usage_type IN ('WORK_DEFINITION', 'WORK_ORDER')),
    usage_id UUID NOT NULL,
    referenced BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (standard_operation_id, usage_type, usage_id)
);
```

> قيد “principal واحد فقط لكل sequence” يفضل تنفيذه بقاعدة خدمة أو partial unique index حسب قاعدة البيانات المستخدمة.

---

## 21. قواعد التحقق المهمة

| القاعدة | رسالة الخطأ المقترحة |
|---|---|
| code فريد داخل المنظمة | Standard operation code already exists in this organization |
| count point وautomatically transact لا يجتمعان | Count point and automatically transact are mutually exclusive |
| work center يجب أن يكون نشطًا | Work center must be active |
| لا يمكن تعديل code إذا العملية مستخدمة | Code can't be updated because the operation is used |
| لا يمكن تعديل work center إذا توجد resources | Work center can't be changed while resources exist |
| لا يمكن حذف العملية إذا مستخدمة في work definition أو work order | Standard operation is referenced and can't be deleted |
| لا يمكن إضافة resources لعملية Supplier | Supplier operations can't have internal resources |
| In-House لا تقبل outside processing item | Outside processing item is only valid for supplier operations |
| Supplier تحتاج outside processing item | Outside processing item is required for supplier operations |
| المورد يجب أن يكون من موارد مركز العمل | Resource must belong to the selected work center |
| المورد يجب أن يكون active | Resource is inactive |
| units_assigned لا تتجاوز المتاح | Assigned units exceed available units |
| usage يجب أن تكون أكبر من صفر | Usage must be greater than zero |
| principal واحد فقط داخل same sequence | Only one principal resource is allowed per simultaneous resource sequence |
| scheduled يحتاج UOM من فئة duration | Resource UOM isn't valid for scheduling |
| active operation فقط تضاف إلى work definition/work order | Only active standard operations can be used |
| بعد copy/override لا يمكن العودة إلى referenced | Overridden standard operation can't be converted back to referenced |

---

## 22. الصلاحيات المقترحة

| الوظيفة | Maintenance Manager | Maintenance Technician | Maintenance Planner / Admin |
|---|---:|---:|---:|
| عرض Standard Operations | نعم | نعم | نعم |
| إنشاء Standard Operation | نعم | لا | نعم |
| تعديل Standard Operation | نعم | لا | نعم |
| حذف Standard Operation | نعم | لا | نعم |
| تعطيل Standard Operation | نعم | لا | نعم |
| إدارة Resources داخل العملية | نعم | لا | نعم |
| إدارة Alternates | نعم | لا | نعم |
| إدارة Attachments | نعم | محدود | نعم |
| إدارة Repair Codes | نعم | لا | نعم |
| إدارة Flexfields | لا | لا | Admin |
| تحميل Spreadsheet | نعم | لا | نعم |
| استخدام العملية داخل Work Order | نعم | نعم حسب الصلاحية | نعم |

---

## 23. Backlog تنفيذي للفصل 7

| الأولوية | المهمة |
|---|---|
| P0 | إنشاء جداول standard operations وresources وattachments وusages. |
| P0 | بناء StandardOperationService. |
| P0 | إنشاء API للبحث والإنشاء والتعديل والحذف. |
| P0 | تنفيذ قيود code uniqueness وcount/auto mutual exclusivity. |
| P0 | تنفيذ منع الحذف عند الاستخدام. |
| P1 | شاشة Manage Standard Operations. |
| P1 | شاشة Create/Edit Standard Operation. |
| P1 | إدارة resources للعمليات In-House. |
| P1 | إدارة supplier operation details. |
| P1 | إدارة attachments. |
| P2 | دعم repair coding وربطه بـ condition event codes. |
| P2 | دعم alternate resources. |
| P2 | تتبع usages داخل work definitions/work orders. |
| P2 | آلية copy/reference عند استخدام العملية في work definition. |
| P2 | آلية copy دائمًا عند استخدام العملية في work order. |
| P3 | Flexfields/custom fields. |
| P3 | Spreadsheet import/update. |
| P3 | BI/analytics metadata. |

---

## 24. Acceptance Criteria مختصرة

| القصة | معيار القبول |
|---|---|
| كمدير صيانة أريد إنشاء عملية قياسية | عند حفظ عملية بكود فريد ومركز عمل نشط، تظهر في البحث ويمكن استخدامها. |
| كمخطط أريد إضافة موارد للعملية | لا يمكن إضافة إلا موارد نشطة تابعة لمركز العمل، ولا تتجاوز الوحدات المتاحة. |
| كمخطط أريد إنشاء عملية مورد خارجي | تظهر حقول outside processing item والمورد، ولا يسمح بإضافة resources داخلية. |
| كمستخدم أريد استخدام عملية في work definition كـ reference | تظهر العملية ومواردها، وأي تعديل لاحق في العملية القياسية ينعكس على التعريف. |
| كمستخدم أريد نسخ العملية | تصبح العملية مستقلة ولا تتأثر بتحديثات المصدر. |
| كمستخدم أريد حذف عملية غير مستخدمة | يسمح الحذف فقط إذا لا توجد references. |
| كمسؤول ضمان أريد repair codes | تنتقل الأكواد إلى work order وتظهر في transactions/claims لاحقًا. |
| كمسؤول بيانات أريد spreadsheet upload | تظهر أخطاء كل صف ولا يتم رفع الحقول read-only. |

---

## 25. ربط الفصل بالفصول السابقة واللاحقة

| الفصل | العلاقة |
|---|---|
| Maintenance Organization | تحتاج Work Centers وResources قبل إنشاء Standard Operation. |
| Assets | العملية لاحقًا ستطبق على أصول داخل work definitions أو work orders. |
| Supplier Warranty | Repair codes وStandard Repair Times يعتمدون على standard operations. |
| Maintenance Work Definitions | الفصل التالي يستخدم standard operations لبناء قوالب الصيانة. |
| Work Orders | أوامر العمل تستخدم العمليات كنسخة تنفيذية. |
| Execution | الموارد وcount point/auto transact تتحكم في reporting. |

---

## 26. خلاصة الفصل

الفصل السابع يضيف مكتبة عمليات قياسية reusable. المطلوب برمجيًا هو بناء إدارة كاملة لرأس العملية، نوع العملية، مركز العمل، قواعد التنفيذ، الموارد، الموارد البديلة، مرفقات التعليمات، أكواد الإصلاح، الحقول الإضافية، REST API، والتحميل الجماعي. أهم نقطة تصميم هي التمييز بين:

```text
Reference in Work Definition  => تحديثات المصدر تنعكس لاحقًا
Copy in Work Definition       => نسخة مستقلة
Copy in Work Order            => دائمًا نسخة مستقلة
```

الفصل التالي هو **الفصل 8 — Maintenance Work Definitions / تعريفات أعمال الصيانة**، وهو يستخدم Standard Operations لبناء قوالب الصيانة الكاملة.
