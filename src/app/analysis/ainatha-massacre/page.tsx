import Image from 'next/image';

export const metadata = {
  title: 'معركة المقتلة في محور عيناثا - بنت جبيل',
  description: 'قراءة تحليلية عسكرية معلوماتية في بيان غرفة عمليات المقاومة الإسلامية حول المواجهة البطولية في محور عيناثا.',
};

export default function ArticleAinatha() {
  return (
    <main dir="rtl" className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative w-full h-[65vh] min-h-[420px] overflow-hidden">
        <Image src="/images/analysies/مقتلة٢.jpeg" alt="المواجهات البطولية في بلدة عيناثا" fill className="object-cover object-center opacity-85" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-700 text-white text-xs font-bold px-3 py-1 tracking-widest">تحليل ميداني</span>
            <span className="text-zinc-400 text-sm">٢٩–٣١ مارس ٢٠٢٦</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white mb-2">معركة <span className="text-red-400">"المقتلة"</span></h1>
          <h2 className="text-xl md:text-2xl text-zinc-300 font-medium mb-3">محور عيناثا — بنت جبيل</h2>
          <p className="text-zinc-400 text-sm max-w-2xl">قراءة تحليلية عسكرية معلوماتية في بيان غرفة عمليات المقاومة الإسلامية حول المواجهة البطولية في محور عيناثا</p>
          <p className="text-zinc-500 text-xs mt-2">جمال شعيب</p>
        </div>
      </div>

      <div className="border-y border-zinc-800 bg-zinc-900/80">
        <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '٢٥', label: 'آلية مدرعة في الهجوم' },
            { num: '٤+', label: 'آليات أصيبت أو أُوقفت' },
            { num: '٣', label: 'أيام معركة متواصلة' },
            { num: '+١٥', label: 'صلية مدفعية' },
          ].map((s) => (
            <div key={s.label} className="text-center border border-zinc-800 rounded p-3 bg-zinc-950/50">
              <div className="text-2xl font-bold text-red-500 font-mono">{s.num}</div>
              <div className="text-xs text-zinc-400 mt-1 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <section>
          <h2 className="text-xl font-bold text-red-400 mb-4">لماذا عيناثا؟</h2>
          <p className="text-zinc-200 leading-relaxed text-lg border-r-4 border-red-700 pr-5">
            لم تكن عيناثا غاية في حد ذاتها، بل كانت مفتاح القفل. مدينة بنت جبيل، المركز المعنوي والعسكري للقطاع الأوسط، أثبتت في 2006 أنها لا تُستباح بهجوم مباشر. لذا لجأ العدو هذه المرة إلى مسلك مختلف: الاقتراب غير المباشر — التسلل إلى ظهر المدينة من جهتها الشمالية الشرقية عبر محور عيناثا، لمحاصرتها وإسقاطها دون الدخول في شوارعها المتاهية.
          </p>
          <p className="text-zinc-300 leading-relaxed mt-4">كانت عيناثا الدرع الأمامي لبنت جبيل من ناحية الشرق؛ سقوطها يعني كشف الظهر وتسهيل التطويق الكامل.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-100 mb-4">مراحل المعركة</h2>
          {[
            { phase: 'الليلة السابقة', title: 'مناورة الخداع', time: '٢٨ آذار — ٢٠:٤٥', text: 'لم يبدأ الهجوم عشوائياً. في مساء ٢٨ آذار/مارس، تحركت ٤ دبابات ميركافا وجرافتان وناقلة جند واحدة من خلة التاروق جنوب مارون الراس باتجاه خلة الخانوق في عيترون. الرسالة المقصودة للمراقب: هذا هو المحور. لكن الرسالة الحقيقية كانت معاكسة تماماً. كان الهدف استدراج عيون المقاومة وأسلحتها نحو الجنوب، واستنزاف يقظتها، تمهيداً للضربة الأصلية قبل الفجر بساعات.', note: 'لكن الخداع لم ينطلِ. تتبعت المقاومة الحركتين معاً.' },
            { phase: 'المرحلة ١', title: 'شواظ في الظلام', time: '٢٩ آذار — ٠١:٣٠', text: 'فجر الأحد، تحرك العمود الحقيقي. قوة مركبة من لواء ٤٠١ — أقوى ألوية المدرعات الإسرائيلية المجهزة بالميركافا 4 — ولواء غفعاتي النخبوي، بمجموع ٢٥ آلية مدرعة. عند مرتفع غدماثا، فجّر مجاهدو الهندسة عبوة شواظ في دبابة ميركافا متقدمة، وفي الوقت ذاته انفجرت تشريكة ميكانيكية في جرافة D9.', note: 'توقف الزخم الهجومي في اللحظة التي بلغ فيها مداه.' },
            { phase: 'المرحلة ٢', title: 'الالتفاف المستدرَج', time: '٢٩ آذار — ١٠:٠٠', text: 'ضرب العقل القيادي للعدو في خيار بديل: إن لم يكن محور غدماثا، فلتكن الاستدارة عبر كرحبون وخلة الحجة من الجهة الشرقية. ما بدا مساراً أقل تحصيناً كان في الواقع جيب قتل آخر. لم تكن هناك ثغرة — كانت هناك منافذ وضعت عند كل منها سلاح.' },
            { phase: 'المرحلة ٣', title: 'الاستنزاف المتراكم', time: '٢٩ آذار — ١٥:٠٠ و١٦:٠٠', text: 'حاول العدو استئناف الاندفاع بعد الظهر. في منطقة السدر بعيناثا، انفجرت عبوة شواظ جديدة في دبابة عند الساعة ٣ عصراً، ثم تشريكة ميكانيكية في دبابة أخرى بالساعة ٤ عصراً. في غضون ١٤ ساعة أصيبت أو أُوقفت ٤ آليات على الأقل. أكثر من ١٥ صلية مدفعية في ثلاثة أيام لعزل ساحة المعركة.' },
            { phase: 'المرحلة ٤', title: 'الاشتباك القريب', time: '٣٠ مارس — ١٢:٠٠–١٧:٠٠', text: 'مع تثبيت المدرعات وشل مناورتها، تحولت المعركة إلى طابعها الأكثر خطورة: ٣ اشتباكات متوالية داخل البلدة في منطقتَي غدماثا والسدر. هنا دخل سلاح الصواريخ الموجهة بصورته المباشرة — أُطلق صاروخ موجّه وأصاب ميركافا.' },
            { phase: 'المرحلة ٥', title: 'قطع الرأس', time: '٣٠ مارس — ١٩:٤٥', text: 'الضربة الأكثر دلالة كانت في الغسق. أنشأ العدو غرفة قيادة ميدانية متقدمة عند محيط تلة الفريز. رصدتها المقاومة. الساعة ٧:٤٥ مساءً — أُطلق صاروخ نوعي فحقق إصابة دقيقة في نقطة التموضع القيادية. ضربة في قلب الدماغ العملياتي للقوة المهاجمة في أحرج لحظاتها.' },
          ].map((item) => (
            <div key={item.phase} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-zinc-800/60 border-b border-zinc-700">
                <span className="text-red-400 font-bold text-sm">{item.phase}</span>
                <span className="text-zinc-100 font-semibold">{item.title}</span>
                <span className="text-zinc-500 text-xs mr-auto">{item.time}</span>
              </div>
              <div className="p-5">
                <p className="text-zinc-300 leading-relaxed text-sm">{item.text}</p>
                {item.note && <p className="mt-3 text-red-300 font-semibold text-sm border-r-2 border-red-600 pr-3">{item.note}</p>}
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-100 mb-4">الخريطة التكتيكية</h2>
          <div className="rounded-lg overflow-hidden border border-zinc-700">
            <Image src="/images/analysies/مقتلة١.jpeg" alt="خريطة معركة المقتلة في عيناثا" width={1000} height={1200} className="w-full h-auto" />
          </div>
          <p className="text-zinc-500 text-xs mt-2 text-center">خريطة وضعية تكتيكية — معركة المقتلة في عيناثا، محور بنت جبيل، ٢٩–٣١ مارس ٢٠٢٦</p>
        </section>

        <section className="bg-zinc-900 border border-red-900/40 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-5">ماذا أثبتت هذه المعركة؟</h2>
          <div className="space-y-4">
            {[
              { num: 'أولاً', text: 'أسقطت المناورة المدرعة المشتركة. قوة من لوائَي ٤٠١ وغفعاتي معاً — نخبة المدرعات والمشاة الإسرائيليَّين — أُوقفت التقدم بمنظومة أسلحة مشتركة: هندسة قتالية + صواريخ موجهة + مشاة + مدفعية.' },
              { num: 'ثانياً', text: 'ظلت شبكة القيادة والسيطرة للمقاومة فاعلة بالكامل طوال ٣ أيام تحت القصف الجوي المتواصل، مع تنسيق صارم بين وحدات الرصد والهندسة والدروع والمدفعية.' },
              { num: 'ثالثاً', text: 'أُحكم الدرع حول بنت جبيل. بتحويل عيناثا إلى منطقة تدمير بدلاً من ممر عبور، أسقطت المقاومة المبدأ العملياتي الإسرائيلي القائم على الالتفاف — ولم تتحرك دبابة واحدة نحو الجهة الشمالية الشرقية لبنت جبيل.' },
            ].map((item) => (
              <div key={item.num} className="flex gap-4">
                <span className="text-red-500 font-bold text-sm whitespace-nowrap mt-1">{item.num}:</span>
                <p className="text-zinc-300 leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
