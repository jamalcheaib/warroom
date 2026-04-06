// src/app/analysis/taofan-alsawarikh-march-2026/page.tsx
// مقال: طوفان الصواريخ ومقبرة الميركافا

import Image from 'next/image';

export const metadata = {
  title: 'طوفان الصواريخ ومقبرة الميركافا: الميدان اللبناني يكسر أرقاماً قياسية',
  description: 'شهدت الجبهة اللبنانية في الساعات الـ 24 الماضية تحولاً دراماتيكياً وضع الآلة العسكرية الإسرائيلية في مأزق عملياتي غير مسبوق.',
};

export default function ArticleTaofan() {
  return (
    <main dir="rtl" className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* Hero */}
      <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/analysis-infographic-20260325.jpeg"
          alt="تقرير مارس 2026 العسكري"
          fill
          className="object-cover object-top opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 tracking-widest uppercase">تقرير ميداني</span>
            <span className="text-zinc-400 text-sm">مارس ٢٠٢٦</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white mb-3">
            طوفان الصواريخ ومقبرة الميركافا
            <span className="block text-red-400 mt-1">الميدان اللبناني يكسر أرقاماً قياسية</span>
          </h1>
          <p className="text-zinc-300 text-sm">بيروت | جمال شعيب</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-zinc-800 bg-zinc-900/80">
        <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '87', label: 'عملية عسكرية في 24 ساعة' },
            { num: '10+2', label: 'دبابات ميركافا + جرافة D9' },
            { num: '+100', label: 'صاروخ في ساعة ونصف' },
            { num: '6', label: 'فرق عسكرية معادية على الجبهة' },
          ].map((s) => (
            <div key={s.label} className="text-center border border-zinc-800 rounded p-3 bg-zinc-950/50">
              <div className="text-2xl font-bold text-red-500 font-mono">{s.num}</div>
              <div className="text-xs text-zinc-400 mt-1 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <article className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* مقدمة */}
        <p className="text-lg text-zinc-200 leading-relaxed border-r-4 border-red-600 pr-5">
          شهدت الجبهة اللبنانية في الساعات الـ 24 الماضية تحولاً دراماتيكياً وضع الآلة العسكرية الإسرائيلية في مأزق عملياتي غير مسبوق. ففي يومٍ وُصف بأنه "استثناء عملياتي بامتياز"، سجلت المقاومة الإسلامية رقماً قياسياً بتنفيذ 87 عملية عسكرية، تنوعت بين التصدي البطولي لقوات المشاة، وإرساء معادلات نارية وصلت شظاياها إلى العمق الاستراتيجي للكيان.
        </p>

        {/* المشهد البري */}
        <section>
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-0.5 bg-red-600 inline-block" />
            المشهد البري: "مجزرة دبابات" تعيد رسم الخطوط الأمامية
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            على طول الحافة الأمامية، وتحديداً في محوري <strong className="text-zinc-100">(الطيبة – القنطرة)</strong> و<strong className="text-zinc-100">(القوزح – دبل)</strong>، تحولت الوديان والقرى الملاصقة للحدود إلى "مطحنة" لسلاح المدرعات الإسرائيلي.
          </p>
          <div className="space-y-3">
            {[
              { title: 'الكمائن المركبة', text: 'اعتمدت المقاومة تكتيك "الكمين المزدوج والمثلث"؛ حيث يتم تدمير الآلية الأولى، والانتظار حتى تقدم قوات الإخلاء ليتم استهدافها مجدداً بالصواريخ الموجهة والمدفعية.' },
              { title: 'حصيلة الدروع', text: 'دُمرت في محور (الطيبة - المحيسبات - القنطرة) وحده 10 دبابات ميركافا وجرافتان عسكريتان من طراز D9.' },
              { title: 'الإسناد المسير (CAS)', text: 'في تطور نوعي، دمجت المقاومة "سلاح الجو المسير" مع قوات المشاة، موفرةً إسناداً جوياً قريباً عبر أسراب انقضاضية استهدفت خطوط التماس في الخيام ودبل.' },
            ].map((item) => (
              <div key={item.title} className="bg-zinc-900 border border-zinc-800 rounded p-4">
                <div className="text-red-400 font-semibold text-sm mb-1">{item.title}</div>
                <p className="text-zinc-300 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* مناورة النار */}
        <section>
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-0.5 bg-red-600 inline-block" />
            مناورة النار: "الكريوت" و"دادو" تحت القصف الاستراتيجي
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            لم يقتصر الزخم الناري على الحافة الأمامية، بل امتد ليشمل العمق الاستراتيجي، رداً على سياسة "الأرض المحروقة" التي ينتهجها العدو.
          </p>
          <div className="space-y-3">
            {[
              { title: 'قواعد القيادة', text: 'تعرضت قاعدة "دادو" (مقر قيادة المنطقة الشمالية في صفد) وقاعدة "ميرون" للمراقبة الجوية لضربات دقيقة.' },
              { title: 'معادلة المدنيين', text: 'أُدخلت منطقة "الكريوت" شمال حيفا تحت النار مرتين بصليات صاروخية نوعية.' },
              { title: 'كثافة الإطلاق', text: 'سُجل إطلاق أكثر من 100 صاروخ في غضون ساعة ونصف فقط، مما عكس تماسكاً استثنائياً في منظومة القيادة والسيطرة.' },
            ].map((item) => (
              <div key={item.title} className="bg-zinc-900 border border-zinc-800 rounded p-4">
                <div className="text-red-400 font-semibold text-sm mb-1">{item.title}</div>
                <p className="text-zinc-300 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* العدو الإسرائيلي */}
        <section>
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-0.5 bg-red-600 inline-block" />
            العدو الإسرائيلي: عجز بري وتعويض بـ "التفخيخ الهندسي"
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            رغم دفع العدو بـ 6 فرق عسكرية على طول الجبهة، إلا أنه لا يزال "يغرق في وحل الحافة الأمامية".
          </p>
          <div className="space-y-3">
            {[
              { title: 'سياسة الأرض المحروقة', text: 'نتيجة فشله في "التثبيت البري"، لجأ العدو إلى تفخيخ وتدمير الأحياء هندسياً في الخيام والطيبة، في محاولة لتقديم "نصر بصري" لمستوطنيه.' },
              { title: 'العزل العملياتي', text: 'يستمر العدو منذ أسبوع في محاولة فصل جنوب الليطاني عن شماله عبر استهداف الجسور والعبارات (القاسمية، الخردلي) لتقطيع أوصال الإمداد اللوجستي.' },
            ].map((item) => (
              <div key={item.title} className="bg-zinc-900 border border-zinc-800 rounded p-4">
                <div className="text-red-400 font-semibold text-sm mb-1">{item.title}</div>
                <p className="text-zinc-300 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* الدلالات العسكرية */}
        <section className="bg-zinc-900 border border-red-900/40 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4">
            الدلالات العسكرية: تفوق في "حرب الاستنزاف التكتيكي"
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            تثبت حصيلة الـ 87 بياناً عسكرياً، بتوقيتاتها المتزامنة، أن غرفة عمليات المقاومة تدير المعركة بهدوء وفعالية تامة، مع قدرة عالية على الرصد الاستخباري اللحظي. وبينما يحاول العدو كسر إرادة البيئة الحاضنة عبر قصف الضاحية والنبطية، تكرس المقاومة معادلة:
          </p>
          <blockquote className="mt-4 border-r-4 border-red-600 pr-4 text-red-300 font-semibold text-lg">
            "الميدان لنا، والعمق بالعمق، والبادئ أظلم"
          </blockquote>
        </section>

      </article>
    </main>
  );
}
