'use client';

import { useActionState, useState } from 'react';
import { authenticate } from './actions';

export function AuthForm({ register, next }: { register: boolean; next: string }) {
  const [message, action, pending] = useActionState(authenticate.bind(null, register ? 'register' : 'login', next), '');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');

  return <form className="account-form" action={action}>
    <fieldset disabled={pending}>
      <label className="field">아이디
        <input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false}
          minLength={3} maxLength={24} pattern="[A-Za-z0-9_]{3,24}" required
          value={username} onChange={(event) => setUsername(event.target.value)} />
      </label>
      {register && <label className="field">닉네임
        <input name="nickname" autoComplete="nickname" minLength={2} maxLength={20} required
          value={nickname} onChange={(event) => setNickname(event.target.value)} />
      </label>}
      <label className="field">비밀번호
        <input type="password" name="password" autoComplete={register ? 'new-password' : 'current-password'}
          minLength={register ? 9 : undefined} maxLength={128} required />
      </label>
      {register && <p className="form-help">아이디는 영문, 숫자, 밑줄로 3~24자, 비밀번호는 9자 이상으로 입력해 주세요.</p>}
      <button className="button button-primary save-button" type="submit" disabled={pending}>
        {pending ? '처리 중…' : register ? '회원가입' : '로그인'}
      </button>
    </fieldset>
    <p className="form-status error" role="status">{message}</p>
  </form>;
}
