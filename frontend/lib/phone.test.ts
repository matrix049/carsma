import { internationalDigits, telHref, whatsappHref } from './phone';

describe('phone helpers', () => {
  it.each([
    ['0661234567', '212661234567'],
    ['06 61 23 45 67', '212661234567'],
    ['+212 661234567', '212661234567'],
    ['+212 0661234567', '212661234567'],
    ['(+212) 06 61 23 45 67', '212661234567'],
    ['00212 0661234567', '212661234567'],
    ['00212661234567', '212661234567'],
    ['661234567', '212661234567'],
    ['+33 6 12 34 56 78', '33612345678'],
  ])('normalises %s', (input, expected) => {
    expect(internationalDigits(input)).toBe(expected);
  });

  it('rejects numbers that are too short', () => {
    expect(internationalDigits('1234')).toBe('');
    expect(whatsappHref('1234')).toBeNull();
  });

  it('builds call and WhatsApp links', () => {
    expect(telHref('0661234567')).toBe('tel:+212661234567');
    expect(whatsappHref('0661234567', 'Salam')).toBe('https://wa.me/212661234567?text=Salam');
  });
});
