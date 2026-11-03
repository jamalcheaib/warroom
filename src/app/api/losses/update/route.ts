import { NextResponse } from 'next/server';

// موقوف: كان هذا الرابط يكتب في المستودع عبر GITHUB_TOKEN لتحديث صفحة الخسائر القديمة.
// صفحة الخسائر صارت في الأرشيف (/archive/losses) وحلّ محلها «الأثر المعلن» من ملف Excel.
// الكود السابق محفوظ في سجل git لمن يحتاجه.
export const dynamic = 'force-static';

const gone = () =>
  NextResponse.json({ disabled: true, reason: 'هذا الرابط موقوف. البيانات تُحدَّث من ملف Excel المدقَّق وحده.' }, { status: 410 });

export const GET = gone;
export const POST = gone;
