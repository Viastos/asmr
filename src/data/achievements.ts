export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS_LIST: AchievementItem[] = [
  {
    id: 'ach-1',
    title: 'Atomfurki 10 metre duvar tırmandı.',
    description: 'Yer çekimine meydan okudu, dikeyde hız rekoru kırdı.',
    rarity: 'rare',
  },
  {
    id: 'ach-2',
    title: 'İlk kırıntısını başarıyla buldu.',
    description: 'Buzdolabı altındaki 2021 model bisküvi parçası ele geçirildi.',
    rarity: 'common',
  },
  {
    id: 'ach-3',
    title: 'Terlik saldırısından sağ kurtuldu.',
    description: '43 numara anne terliği duvara çakıldı, 0 hasar ile kaçıldı.',
    rarity: 'epic',
  },
  {
    id: 'ach-4',
    title: '3 saniye boyunca ışıkta kaldı.',
    description: 'Gözler kamaştı ama asaletinden ve duruşundan ödün vermedi.',
    rarity: 'common',
  },
  {
    id: 'ach-5',
    title: 'Süpürgeyle karşı karşıya geldi.',
    description: 'Vakum gücüne karşı altı bacakla zemine kenetlendi.',
    rarity: 'rare',
  },
  {
    id: 'ach-6',
    title: 'Çöp kutusuna başarıyla yerleşti.',
    description: 'Organik atık cennetinde 5 yıldızlı süit oda kiralandı.',
    rarity: 'common',
  },
  {
    id: 'ach-7',
    title: 'Antenlerini başarıyla gizleyemedi.',
    description: 'Gazete kenarından sarkan 8 cm bıyık ele verdi.',
    rarity: 'common',
  },
  {
    id: 'ach-8',
    title: 'İlk gece baskınını gerçekleştirdi.',
    description: 'Ev halkı derin uykudayken salon kontrol altına alındı.',
    rarity: 'rare',
  },
  {
    id: 'ach-9',
    title: 'Mutfak tezgahına çıktı.',
    description: 'Zeytinyağı lekesi üzerinde serbest stil kayak yapıldı.',
    rarity: 'rare',
  },
  {
    id: 'ach-10',
    title: 'İnsan tarafından fark edildi.',
    description: 'Çığlık desibeli ölçüldü: 110 dB! Zafer pozu verildi.',
    rarity: 'common',
  },
  {
    id: 'ach-11',
    title: "Raid'den kaçmayı başardı.",
    description: 'Kimyasal dumanın içinden geçip bağışıklık puanı toplandı.',
    rarity: 'epic',
  },
  {
    id: 'ach-12',
    title: '100 kırıntılık servete ulaştı.',
    description: 'Böcek borsasında kırıntı milyarderi ilan edildi.',
    rarity: 'epic',
  },
  {
    id: 'ach-13',
    title: 'Süpürgelik üzerinde ev sahibi oldu.',
    description: 'Duvar dibi 1+0 lüks süpürgelik dairesine taşınıldı.',
    rarity: 'rare',
  },
  {
    id: 'ach-14',
    title: "Gece 04.00'te aktif bulundu.",
    description: 'Hamamböceği mesaisinin en verimli saatinde tam kadro sahada.',
    rarity: 'common',
  },
  {
    id: 'ach-15',
    title: 'Altı bacakla ilk driftini attı.',
    description: 'Fayans zemin üzerinde 360 derece kayarak köşeyi döndü.',
    rarity: 'rare',
  },
  {
    id: 'ach-16',
    title: 'Dolap arkasında VIP statüsüne ulaştı.',
    description: 'Karanlık, sıcak ve tozlu elit loca alanı rezerve edildi.',
    rarity: 'epic',
  },
  {
    id: 'ach-17',
    title: 'Mutfak mafyasına katıldı.',
    description: 'Geceleri buzdolabı kapak nöbeti tutmaya başlandı.',
    rarity: 'legendary',
  },
  {
    id: 'ach-18',
    title: 'Duvarın tapusunu üzerine aldı.',
    description: 'Resmi kira sözleşmesi buzdolabı arkasında imzalandı.',
    rarity: 'legendary',
  },
  {
    id: 'ach-19',
    title: 'Resmi olarak hamamböceği ilan edildi.',
    description: 'Nüfus cüzdanına tür: Periplaneta Americana yazıldı.',
    rarity: 'legendary',
  },
  {
    id: 'ach-20',
    title: 'İnsanlıkla tüm bağlarını kopardı.',
    description: 'Artık sadece kırıntılar, karanlık ve mutlak hakimiyet var.',
    rarity: 'legendary',
  },
];
