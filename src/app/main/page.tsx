import { redirect } from 'next/navigation';

/** /main은 이제 /(루트)로 리다이렉트 */
export default function MainRedirect() {
  redirect('/');
}
