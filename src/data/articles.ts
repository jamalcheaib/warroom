export interface Article {
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  date: string;
  heroImage?: string;
  summary: string;
  content: string;
  tags: string[];
}

export const articles: Article[] = [
  {
    slug: 'gray-wednesday-2026-03-25',
    title: 'طوفان الصواريخ ومقبرة الميركافا: الميدان اللبناني يكسر أرقاماً قياسية',
    author: 'جمال شعيب',
    date: '2026-03-25',
    heroImage: '/images/analysis-infographic-20260325.jpeg',
    summary: 'شهدت الجبهة اللبنانية في الساعات الـ 24 الماضية تحولاً دراماتيكياً وضع الآلة العسكرية الإسرائيلية في مأزق عملياتي غير مسبوق. ففي يومٍ وُصف بأنه "استثناء عملياتي بامتياز"، سجلت المقاومة الإسلامية رقماً قياسياً بتنفيذ 87 عملية عسكرية.',
    tags: ['تقرير ميداني', 'جنوب لبنان', 'دبابات', 'المقاومة الإسلامية'],
    content: `
<div class="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
  <div class="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-center">
    <div class="text-2xl font-bold text-red-500">87</div>
    <div class="text-sm text-zinc-400 mt-1">عملية عسكرية في 24 ساعة</div>
  </div>
  <div class="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-center">
    <div class="text-2xl font-bold text-red-500">10+2</div>
    <div class="text-sm text-zinc-400 mt-1">دبابات ميركافا + جرافة D9</div>
  </div>
  <div class="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-center">
    <div class="text-2xl font-bold text-red-500">100+</div>
    <div class="text-sm text-zinc-400 mt-1">صاروخ في 90 دقيقة</div>
  </div>
  <div class="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-center">
    <div class="text-2xl font-bold text-red-500">6</div>
    <div class="text-sm text-zinc-400 mt-1">فرق عسكرية إسرائيلية على الجبهة</div>
  </div>
</div>

<h2 class="text-xl font-bold mt-8 mb-4 text-red-500">المشهد البري: "مجزرة دبابات" تعيد رسم الخطوط الأمامية</h2>

<p class="mb-4 leading-relaxed">على طول الحافة الأمامية، وتحديداً في محوري (الطيبة – القنطرة) و(القوزح – دبل)، تحولت الوديان والقرى الملاصقة للحدود إلى "مطحنة" لسلاح المدرعات الإسرائيلي.</p>

<h3 class="text-lg font-bold mt-6 mb-3">الكمائن المركبة</h3>
<p class="mb-4 leading-relaxed">اعتمدت المقاومة تكتيك "الكمين المزدوج والمثلث"؛ حيث يتم تدمير الآلية الأولى، والانتظار حتى تقدم قوات الإخلاء ليتم استهدافها مجدداً بالصواريخ الموجهة والمدفعية.</p>

<div class="p-4 rounded-lg bg-red-950/20 border border-red-900/30 my-4"><strong>حصيلة الدروع:</strong> دُمرت في محور (الطيبة - المحيسبات - القنطرة) وحده 10 دبابات ميركافا وجرافتان عسكريتان من طراز D9.</div>

<h3 class="text-lg font-bold mt-6 mb-3">الإسناد المسير (CAS)</h3>
<p class="mb-4 leading-relaxed">في تطور نوعي، دمجت المقاومة "سلاح الجو المسير" مع قوات المشاة، موفرةً إسناداً جوياً قريباً عبر أسراب انقضاضية استهدفت خطوط التماس في الخيام ودبل.</p>

<h2 class="text-xl font-bold mt-8 mb-4 text-red-500">مناورة النار: "الكريوت" و"دادو" تحت القصف الاستراتيجي</h2>

<p class="mb-4 leading-relaxed">لم يقتصر الزخم الناري على الحافة الأمامية، بل امتد ليشمل العمق الاستراتيجي، رداً على سياسة "الأرض المحروقة" التي ينتهجها العدو.</p>

<h3 class="text-lg font-bold mt-6 mb-3">قواعد القيادة</h3>
<p class="mb-4 leading-relaxed">تعرضت قاعدة "دادو" (مقر قيادة المنطقة الشمالية في صفد) وقاعدة "ميرون" للمراقبة الجوية لضربات دقيقة.</p>

<h3 class="text-lg font-bold mt-6 mb-3">معادلة المدنيين</h3>
<p class="mb-4 leading-relaxed">أُدخلت منطقة "الكريوت" شمال حيفا تحت النار مرتين بصليات صاروخية نوعية.</p>

<div class="p-4 rounded-lg bg-red-950/20 border border-red-900/30 my-4"><strong>كثافة الإطلاق:</strong> سُجل إطلاق أكثر من 100 صاروخ في غضون ساعة ونصف فقط، مما عكس تماسكاً استثنائياً في منظومة القيادة والسيطرة.</div>

<h2 class="text-xl font-bold mt-8 mb-4 text-red-500">العدو الإسرائيلي: عجز بري وتعويض بـ "التفخيخ الهندسي"</h2>

<p class="mb-4 leading-relaxed">رغم دفع العدو بـ 6 فرق عسكرية على طول الجبهة، إلا أنه لا يزال "يغرق في وحل الحافة الأمامية".</p>

<h3 class="text-lg font-bold mt-6 mb-3">سياسة الأرض المحروقة</h3>
<p class="mb-4 leading-relaxed">نتيجة فشله في "التثبيت البري"، لجأ العدو إلى تفخيخ وتدمير الأحياء هندسياً في الخيام والطيبة، في محاولة لتقديم "نصر بصري" لمستوطنيه يعوض به خسائره الفادحة.</p>

<h3 class="text-lg font-bold mt-6 mb-3">العزل العملياتي</h3>
<p class="mb-4 leading-relaxed">يستمر العدو منذ أسبوع في محاولة فصل جنوب الليطاني عن شماله عبر استهداف الجسور والعبارات (القاسمية، الخردلي) لتقطيع أوصال الإمداد اللوجستي.</p>

<h2 class="text-xl font-bold mt-8 mb-4 text-red-500">الدلالات العسكرية: تفوق في "حرب الاستنزاف التكتيكي"</h2>

<p class="mb-4 leading-relaxed">تثبت حصيلة الـ 87 بياناً عسكرياً، بتوقيتاتها المتزامنة، أن غرفة عمليات المقاومة تدير المعركة بهدوء وفعالية تامة، مع قدرة عالية على الرصد الاستخباري اللحظي.</p>

<blockquote class="border-r-4 border-red-500 pr-4 my-4 italic text-zinc-400">وبينما يحاول العدو كسر إرادة البيئة الحاضنة عبر قصف الضاحية والنبطية، تكرس المقاومة معادلة: "الميدان لنا، والعمق بالعمق، والبادئ أظلم".</blockquote>
    `.trim(),
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
