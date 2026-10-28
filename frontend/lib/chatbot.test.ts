import { matchTopics, planReply, normalise, topicAnswer, isAffirmative } from './chatbot';

describe('chatbot intent matching', () => {
  it.each([
    ['ch7al taman dyal lawha?', 'price'],
    ['combien ça coûte ?', 'price'],
    ['how much is it', 'price'],
    ['شحال الثمن؟', 'price'],
    ['واش كتوصلو للعيون؟', 'delivery'],
    ['vous livrez à Agadir ?', 'delivery'],
    ['wach kayn lon zr9?', 'colors'],
    ['est-ce que vous faites en rouge', 'colors'],
    ['واش كاين اللون الأحمر', 'colors'],
    ['ch7al l 3d', 'style'],
    ['taille disponible ?', 'size'],
    ['wach kayn retour?', 'returns'],
    ['kifach nlsa9ha f l7it?', 'hang'],
    ['do you give the double face scotch?', 'hang'],
    ['est-ce que la colle est fournie ?', 'hang'],
    ['كيفاش نلصقها؟', 'hang'],
    ['fin wslat la commande dyali', 'order'],
  ])('%s → %s', (text, topic) => {
    expect(matchTopics(text)).toContain(topic);
  });

  it('gives the new delivery time and mounting answer', () => {
    expect(topicAnswer('en', 'delivery')).toContain('48 hours');
    expect(topicAnswer('fr', 'hang')).toContain('double face');
    expect(topicAnswer('en', 'returns')).toContain('broken');
  });

  it('does not read Casablanca (البيضاء) as the colour white', () => {
    expect(matchTopics('واش كتوصلو للدار البيضاء')).not.toContain('colors');
  });

  it('treats "can you deliver" as a delivery question, not a custom request', () => {
    const topics = matchTopics('wach t9dro twslo l agadir');
    expect(topics).toContain('delivery');
    expect(topics).not.toContain('custom');
  });

  it('starts the custom-request questions, prefilled when a car is named', () => {
    expect(planReply('wach t9dro tdirou lia golf 7 r 2018')).toEqual({
      kind: 'flow',
      prefillItem: 'golf 7 r 2018',
      lead: undefined,
    });
    expect(planReply('ديرو ليا طوموبيلتي BMW M3 E46')).toMatchObject({ kind: 'flow', prefillItem: 'BMW M3 E46' });
    expect(planReply('vous pouvez faire mon logo ?')).toMatchObject({ kind: 'flow', prefillItem: undefined });
    expect(planReply('عندي لوغو واش تقدرو تديروه')).toMatchObject({ kind: 'flow' });
  });

  it('answers short known questions instantly and sends the rest to the AI', () => {
    expect(planReply('salam, ch7al taman?')).toEqual({ kind: 'answer', topics: ['price'] });
    expect(planReply('bghit chi haja zwina l salon dyali')).toMatchObject({ kind: 'ai' });
    // A named car goes to the AI so it can suggest matching pieces.
    expect(planReply('ch7al bmw?')).toMatchObject({ kind: 'ai', fallback: ['price'] });
  });

  it('normalises Arabic spelling variants', () => {
    expect(normalise('الأَلوان')).toBe(normalise('الالوان'));
  });

  it('fills the catalogue price range into the price answer', () => {
    expect(topicAnswer('en', 'price', { min: 179, max: 199 })).toContain('179–199 MAD');
    expect(topicAnswer('fr', 'price')).toContain('Garage');
  });

  it.each(['wakha', 'ah', 'oui', 'yes please', 'واخا', 'نعم', 'إيه أكد'])('"%s" confirms', (text) => {
    expect(isAffirmative(text)).toBe(true);
  });

  it.each(['la', 'non merci', 'not yet', 'لا', 'ماشي دابا', 'ch7al taman?'])('"%s" does not confirm', (text) => {
    expect(isAffirmative(text)).toBe(false);
  });
});
