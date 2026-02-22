export async function sendKakaoAlimtalk(
  phone,
  templateCode,
  templateParams = {},
) {
  const apiUrl = process.env.KAKAO_ALIMTALK_API_URL;
  const apiKey = process.env.KAKAO_ALIMTALK_API_KEY;
  const senderKey = process.env.KAKAO_ALIMTALK_SENDER_KEY;

  if (!apiUrl || !apiKey || !senderKey || !templateCode) {
    console.warn('[Kakao Alimtalk] 설정 부족', {
      hasUrl: !!apiUrl,
      hasKey: !!apiKey,
      hasSenderKey: !!senderKey,
      templateCode,
    });
    return false;
  }

  if (!phone) return false;

  const phoneNumber = phone.startsWith('0')
    ? `82${phone.replace(/-/g, '').slice(1)}`
    : phone.replace(/-/g, '');

  try {
    const body = {
      sender_key: senderKey,
      template_code: templateCode,
      receiver_list: [
        {
          receiver_num: phoneNumber,
          template_params: templateParams,
        },
      ],
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(
        '[Kakao Alimtalk] 발송 실패',
        res.status,
        templateCode,
        data,
      );
      return false;
    }

    console.log('[Kakao Alimtalk] 발송 완료', templateCode, phone, data);
    return true;
  } catch (err) {
    console.error('[Kakao Alimtalk] 발송 오류', templateCode, err);
    return false;
  }
}

/** 관리자 번호 목록 (env 쉼표 구분) */
function getAdminPhones() {
  const raw = process.env.KAKAO_ALIMTALK_ADMIN_PHONE || '';
  return raw
    .split(',')
    .map((p) => p.trim().replace(/-/g, ''))
    .filter(Boolean);
}

export async function sendScheduleConfirmedAlimtalk(
  phone,
  userName,
  scheduleInfo,
) {
  const templateCode = 'schedule_confirm';
  if (!templateCode) {
    console.warn(
      '[Kakao Alimtalk] 스케줄 확정 템플릿 미설정 (KAKAO_ALIMTALK_TEMPLATE_CODE_CONFIRMED)',
    );
    return false;
  }

  const scheduleLabel = `${scheduleInfo.date} ${scheduleInfo.time} ${scheduleInfo.groom}/${scheduleInfo.bride}`;
  const templateParams = {
    userName: userName || '고객',
    date: scheduleInfo.date,
    time: scheduleInfo.time,
    groom: scheduleInfo.groom,
    bride: scheduleInfo.bride,
    venue: scheduleInfo.venue || '',
    scheduleLabel,
  };

  return sendKakaoAlimtalk(phone, templateCode, templateParams);
}

// ---- Cron 스케줄 알림 (기상/출발/도착/관리자 지연) ----

export async function sendCronWakeupAlimtalk(phone, scheduleLabel) {
  const templateCode = 'report_wake';
  if (!templateCode) {
    console.warn(
      '[CRON] 기상 알림톡 미설정 (KAKAO_ALIMTALK_TEMPLATE_WAKEUP)',
      phone,
      scheduleLabel,
    );
    return false;
  }
  return sendKakaoAlimtalk(phone, templateCode, { scheduleLabel });
}

export async function sendCronDepartureAlimtalk(phone, scheduleLabel) {
  const templateCode = 'report_depart';
  if (!templateCode) {
    console.warn(
      '[CRON] 출발 알림톡 미설정 (KAKAO_ALIMTALK_TEMPLATE_DEPARTURE)',
      phone,
      scheduleLabel,
    );
    return false;
  }
  return sendKakaoAlimtalk(phone, templateCode, { scheduleLabel });
}

export async function sendCronArrivalAlimtalk(phone, scheduleLabel) {
  const templateCode = 'report_arrive';
  if (!templateCode) {
    console.warn(
      '[CRON] 도착 알림톡 미설정 (KAKAO_ALIMTALK_TEMPLATE_ARRIVAL)',
      phone,
      scheduleLabel,
    );
    return false;
  }
  return sendKakaoAlimtalk(phone, templateCode, { scheduleLabel });
}

/** 종료 알림톡 (예식+1h 시점) */
export async function sendCronCompletedAlimtalk(phone, scheduleLabel) {
  const templateCode = 'report_end';
  if (!templateCode) {
    console.warn(
      '[CRON] 종료 알림톡 미설정 (KAKAO_ALIMTALK_TEMPLATE_COMPLETED)',
      phone,
      scheduleLabel,
    );
    return false;
  }
  return sendKakaoAlimtalk(phone, templateCode, { scheduleLabel });
}

/** 관리자 기상 지연 알림톡 */
export async function sendCronAdminDelayAlimtalk(scheduleLabel, userName) {
  const templateCode = 'admin_no_wake';
  const adminPhones = getAdminPhones();
  if (!templateCode || adminPhones.length === 0) {
    console.warn(
      '[CRON] 관리자 기상 지연 알림톡 미설정',
      scheduleLabel,
      userName,
    );
    return false;
  }
  const templateParams = { scheduleLabel, userName: userName || '-' };
  let ok = true;
  for (const phone of adminPhones) {
    const result = await sendKakaoAlimtalk(phone, templateCode, templateParams);
    if (!result) ok = false;
  }
  return ok;
}

/** 관리자 출발 지연 알림톡 */
export async function sendCronAdminDepartureDelayAlimtalk(
  scheduleLabel,
  userName,
) {
  const templateCode = 'admin_no_depart';
  const adminPhones = getAdminPhones();
  if (!templateCode || adminPhones.length === 0) {
    console.warn(
      '[CRON] 관리자 출발 지연 알림톡 미설정',
      scheduleLabel,
      userName,
    );
    return false;
  }
  const templateParams = { scheduleLabel, userName: userName || '-' };
  let ok = true;
  for (const phone of adminPhones) {
    const result = await sendKakaoAlimtalk(phone, templateCode, templateParams);
    if (!result) ok = false;
  }
  return ok;
}

/** 관리자 도착 지연 알림톡 */
export async function sendCronAdminArrivalDelayAlimtalk(
  scheduleLabel,
  userName,
) {
  const templateCode = 'admin_no_arrive';
  const adminPhones = getAdminPhones();
  if (!templateCode || adminPhones.length === 0) {
    console.warn(
      '[CRON] 관리자 도착 지연 알림톡 미설정',
      scheduleLabel,
      userName,
    );
    return false;
  }
  const templateParams = { scheduleLabel, userName: userName || '-' };
  let ok = true;
  for (const phone of adminPhones) {
    const result = await sendKakaoAlimtalk(phone, templateCode, templateParams);
    if (!result) ok = false;
  }
  return ok;
}

/** 관리자 종료 지연 알림톡 */
export async function sendCronAdminCompletedDelayAlimtalk(
  scheduleLabel,
  userName,
) {
  const templateCode = 'admin_no_end';
  const adminPhones = getAdminPhones();
  if (!templateCode || adminPhones.length === 0) {
    console.warn(
      '[CRON] 관리자 도착 지연 알림톡 미설정',
      scheduleLabel,
      userName,
    );
    return false;
  }
  const templateParams = { scheduleLabel, userName: userName || '-' };
  let ok = true;
  for (const phone of adminPhones) {
    const result = await sendKakaoAlimtalk(phone, templateCode, templateParams);
    if (!result) ok = false;
  }
  return ok;
}
