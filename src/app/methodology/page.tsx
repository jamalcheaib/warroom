import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/field/SiteHeader';
import { BarList, Footer, Kicker, PageFrame, Panel, Swatch } from '@/components/field/ui';
import { getIndex } from '@/lib/field-data';
import { CATEGORY, CATEGORY_ORDER, VERIFICATION, fmt, formatDateLong } from '@/lib/field-format';

export const metadata: Metadata = {
  title: 'المنهجية | غرفة الحرب',
  description: 'كيف يُرصد السجل الميداني للجبهة اللبنانية ويُتحقق منه: المصادر، ومستويات التحقق، وقواعد الاستبعاد، والإحداثيات، والمصطلحات.',
};

const SOURCE_NAMES: Record<string, string> = {
  '@mmirleb': 'الإعلام الحربي — المقاومة الإسلامية',
  '@almayadeen': 'قناة الميادين',
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Panel className="flex flex-col gap-4 scroll-mt-24" as="section">
      <h2 id={id} className="font-kufi text-xl md:text-2xl font-bold">{title}</h2>
      <div className="flex flex-col gap-4 text-[15px] leading-8 text-wr-sub">{children}</div>
    </Panel>
  );
}

export default function MethodologyPage() {
  const idx = getIndex();
  const t = idx.totals;
  const glossary = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'glossary.json'), 'utf-8')) as { terms: { term: string; definition: string }[] };
  const geo = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'geo', 'places.json'), 'utf-8')) as Record<string, { source: string; precision: string }>;
  const geoWiki = Object.values(geo).filter((g) => g.source === 'wikidata').length;
  const geoManual = Object.values(geo).filter((g) => g.source === 'manual').length;
  const ex = idx.excluded;
  const toc = [
    ['scope', 'النطاق'], ['sources', 'المصادر'], ['categories', 'التصنيف'], ['verification', 'مستويات التحقق'],
    ['exclusion', 'الاستبعاد'], ['impact', 'الأثر المعلن والربط'], ['geo', 'المواقع والإحداثيات'], ['glossary', 'مصطلحات'],
  ];

  return (
    <PageFrame>
      <SiteHeader active="methodology" band={{ right: 'المنهجية', left: `آخر تحديث للبيانات: ${formatDateLong(idx.lastDate)}` }} />
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 pt-8 pb-16 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Kicker>كيف نرصد وكيف نتحقق</Kicker>
          <h1 className="font-kufi text-3xl md:text-[40px] font-extrabold">المنهجية</h1>
          <p className="text-wr-sub leading-8 max-w-[780px]">السجل الميداني حصيلة رصد يومي لقنوات إخبارية محددة، يُفرز فيه كل منشور ويُصنَّف ويُربط بموقعه ومصدره، ويُستبعد منه ما لا يتصل بالجبهة اللبنانية أو يكرر غيره. هنا القواعد التي يقوم عليها.</p>
        </div>
        <nav aria-label="محتويات الصفحة" className="flex flex-wrap gap-2">
          {toc.map(([id, l]) => <a key={id} href={`#${id}`} className="min-h-10 px-3 flex items-center rounded border border-wr-line2 bg-wr-deep text-sm text-wr-sub hover:border-wr-gold hover:text-white">{l}</a>)}
        </nav>

        <Section id="scope" title="النطاق">
          <p>
            الجبهة اللبنانية من {formatDateLong(idx.firstDate)} إلى {formatDateLong(idx.lastDate)} ({idx.days.length} يوماً)، بتوقيت بيروت.
            يضم السجل {fmt(t.events)} حدثاً موثّقاً و{fmt(t.impact)} بنداً من الأثر المعلن، واستُبعد في الفرز {fmt(ex.total)} منشوراً.
          </p>
          <p>الحدث هو منشور يصف واقعة واحدة. إذا تكرر الخبر نفسه في أكثر من قناة يُعتمد منشور واحد، وتُحفظ بقية المنشورات «مصادر مكرِّرة» تُحتسب في مستوى التحقق.</p>
        </Section>

        <Section id="sources" title="المصادر">
          <p>القنوات المرصودة على تلغرام، وعدد الأحداث المعتمدة من كل منها:</p>
          <BarList color="#C9A227" items={Object.entries(idx.sources).map(([k, v]) => ({ label: SOURCE_NAMES[k] ? `${SOURCE_NAMES[k]} (${k})` : k, value: v }))} />
          <p>عمليات المقاومة الإسلامية تُعتمد حصراً من بياناتها الرسمية عبر الإعلام الحربي ({'@mmirleb'})، ولا تُعتمد روايتها من قناة أخرى. لذلك استُبعد {fmt(ex.reasons['عملية للمقاومة من غير @mmirleb'] ?? 0)} منشوراً نقلت عمليات للمقاومة عن غير بياناتها.</p>
        </Section>

        <Section id="categories" title="التصنيف">
          <p>لكل حدث فئة واحدة ونوع فرعي:</p>
          <div className="grid gap-3 md:grid-cols-3">
            {CATEGORY_ORDER.map((c) => (
              <div key={c} className="bg-wr-deep border border-wr-line p-4 flex flex-col gap-2">
                <span className="flex items-center gap-2 font-semibold text-wr-text"><Swatch color={CATEGORY[c].color} />{CATEGORY[c].label} · <span className="font-wrmono">{fmt(t[c] ?? 0)}</span></span>
                <span className="text-sm leading-7">{Object.entries(idx.subtypes[c]).slice(0, 7).map(([k, v]) => `${k} (${v})`).join('، ')}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="verification" title="مستويات التحقق">
          <div className="grid gap-3 md:grid-cols-3">
            {([
              ['official', 'منشور صادر عن الجهة نفسها، كبيان المقاومة الإسلامية عن عملية نفّذتها.'],
              ['multi', 'خبر ورد في أكثر من قناة من القنوات المرصودة، بصيغ مستقلة.'],
              ['single', 'خبر ورد في قناة واحدة فقط حتى لحظة الرصد. يُنشر مع هذا الوسم ليقدّر القارئ وزنه.'],
            ] as const).map(([k, d]) => (
              <div key={k} className="bg-wr-deep border border-wr-line p-4 flex flex-col gap-2">
                <span className="font-semibold text-wr-text">{VERIFICATION[k].label} · <span className="font-wrmono">{fmt(idx.verification[k] ?? 0)}</span></span>
                <span className="text-sm leading-7">{d}</span>
              </div>
            ))}
          </div>
          <p>يظهر المستوى على كل بطاقة بثلاث علامات: ثلاث للبيان الرسمي، واثنتان لتعدد المصادر، وواحدة للمصدر الواحد.</p>
        </Section>

        <Section id="exclusion" title="الاستبعاد">
          <p>استُبعد {fmt(ex.total)} منشوراً من السجل، لكل منها سبب مدوَّن:</p>
          <BarList color="#6B7787" items={Object.entries(ex.reasons).map(([k, v]) => ({ label: k, value: v }))} />
          <p>«خارج الجبهة اللبنانية» يعني منشورات عن جبهات أخرى. هذه المنشورات محفوظة في الأرشيف القديم للموقع (<Link href="/archive" className="text-wr-gold">الأرشيف</Link>) ولا تدخل في أرقام السجل.</p>
        </Section>

        <Section id="impact" title="الأثر المعلن والربط">
          <p>الأثر المعلن هو ما أقرّت به المصادر والجهات الإسرائيلية من صفارات واعتراضات وقتلى وجرحى وأضرار. الأرقام عدد البنود المعلنة، لا عدد الإصابات.</p>
          <p>
            يُربط البند بالعملية التي سبقته حين يتطابق المكان والتوقيت: «مربوط» ({fmt(idx.impactLinks.linked ?? 0)}) حين يكون الربط واضحاً،
            و«مرشّح» ({fmt(idx.impactLinks.candidate ?? 0)}) حين يكون محتملاً غير مؤكد، و«غير مربوط» ({fmt(idx.impactLinks.unlinked ?? 0)}) حين لا تُعرف العملية،
            كإنذارات لا يُذكر مصدرها. يظهر الفارق الزمني بين العملية والإعلان على كل ربط.
          </p>
        </Section>

        <Section id="geo" title="المواقع والإحداثيات">
          <p>{fmt(t.withLocation)} حدثاً يذكر مكاناً، منها {fmt(t.geolocated)} محددة على الخريطة. تُحسم الإحداثيات بالترتيب التالي:</p>
          <ol className="list-decimal pr-6 flex flex-col gap-1">
            <li><strong className="text-wr-text">تدقيق يدوي</strong> ({fmt(geoManual)} مكاناً): مواقع حدّدها فريق الرصد أو قدّرها، ومنها مواقع عسكرية مستحدثة حُدّدت من مشاهد مصوّرة.</li>
            <li><strong className="text-wr-text">قاموس Wikidata المفتوح</strong> ({fmt(geoWiki)} مكاناً، رخصة CC0)، مطابقةً بالاسم العربي.</li>
          </ol>
          <p>الرموز على البطاقات:</p>
          <ul className="list-disc pr-6 flex flex-col gap-1">
            <li><span className="font-wrmono text-wr-text">33.38N 35.49E</span>: إحداثيات بلدة أو موقع محدد.</li>
            <li><span className="font-wrmono text-wr-text">≈</span>: إحداثيات تقريبية تحتاج تدقيقاً.</li>
            <li><span className="text-wr-text">منطقة</span>: وادٍ أو تلة أو سهل، تظهر على الخريطة كدائرة متقطعة.</li>
            <li><span className="text-wr-text">منطقة واسعة / نهر / مفهوم عملياتي</span>: لا تُمثَّل بنقطة، مثل الجليل وجنوب الليطاني والخط الأصفر. يظهر الاسم ولا تظهر نقطة مضلِّلة.</li>
          </ul>
          <p>يُنظَّف عمود «الموقع» قبل تحديد الإحداثيات: تُحذف العبارات التي ليست أماكن، وتُصحَّح الأخطاء الإملائية، وتُقسَّم الخانات التي تذكر أكثر من مكان، فيظهر الحدث في كل منها.</p>
        </Section>

        <Section id="glossary" title="مصطلحات">
          <dl className="flex flex-col gap-3">
            {glossary.terms.map((g) => (
              <div key={g.term} className="bg-wr-deep border border-wr-line p-4">
                <dt className="font-kufi font-bold text-wr-text">{g.term}</dt>
                <dd className="mt-1">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </main>
      <Footer text="رصد وتوثيق: جمال شعيب" />
    </PageFrame>
  );
}
