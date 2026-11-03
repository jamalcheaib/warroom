import { NextResponse } from 'next/server';

// موقوف: كان هذا الرابط يعيد تصنيف ملفات data/operations ويكتبها في المستودع عبر GITHUB_TOKEN.
// تلك الملفات صارت أرشيفاً ثابتاً (/archive) لا يُعدَّل آلياً.
// الكود السابق محفوظ في سجل git لمن يحتاجه.
export const dynamic = 'force-static';

const gone = () =>
  NextResponse.json({ disabled: true, reason: 'هذا الرابط موقوف. البيانات تُحدَّث من ملف Excel المدقَّق وحده.' }, { status: 410 });

export const GET = gone;
export const POST = gone;
