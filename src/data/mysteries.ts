export type MysterySetId = 'joyeux' | 'lumineux' | 'douloureux' | 'glorieux';

export interface Mystery {
  title: string;
  fruit: string;
  reference: string;
  meditation: string;
}

export interface MysterySet {
  id: MysterySetId;
  name: string;
  latin: string;
  /** Jours recommandés (0 = dimanche … 6 = samedi). */
  days: number[];
  daysLabel: string;
  mysteries: Mystery[];
}

export const MYSTERY_SETS: MysterySet[] = [
  {
    id: 'joyeux',
    name: 'Mystères Joyeux',
    latin: 'Mysteria Gaudiosa',
    days: [1, 6],
    daysLabel: 'Lundi & Samedi',
    mysteries: [
      {
        title: 'L’Annonciation',
        fruit: 'L’humilité',
        reference: 'Lc 1, 26-38',
        meditation:
          'L’ange Gabriel est envoyé à Nazareth. Marie se trouble, interroge, puis se donne tout entière : « Voici la servante du Seigneur. » Demandons un cœur disponible, qui dit oui sans tout comprendre.',
      },
      {
        title: 'La Visitation',
        fruit: 'La charité fraternelle',
        reference: 'Lc 1, 39-56',
        meditation:
          'Marie part en hâte vers la montagne pour servir sa cousine Élisabeth. Jean tressaille de joie, et le Magnificat jaillit. Portons le Christ à ceux qui nous attendent.',
      },
      {
        title: 'La Nativité',
        fruit: 'L’esprit de pauvreté',
        reference: 'Lc 2, 1-20',
        meditation:
          'Il n’y avait pas de place pour eux dans la salle commune. Le Verbe se fait petit enfant, couché dans une mangeoire. Faisons-lui de la place dans notre vie dépouillée du superflu.',
      },
      {
        title: 'La Présentation au Temple',
        fruit: 'L’obéissance et la pureté',
        reference: 'Lc 2, 22-40',
        meditation:
          'Marie et Joseph offrent l’Enfant selon la Loi. Le vieillard Syméon le reconnaît : « Lumière pour éclairer les nations. » Offrons nos vies au Père, avec confiance.',
      },
      {
        title: 'Le Recouvrement de Jésus au Temple',
        fruit: 'La recherche de Dieu en toutes choses',
        reference: 'Lc 2, 41-52',
        meditation:
          'Après trois jours d’angoisse, Marie et Joseph retrouvent Jésus parmi les docteurs : « Je dois être chez mon Père. » Cherchons-le sans nous lasser, même dans l’obscurité.',
      },
    ],
  },
  {
    id: 'lumineux',
    name: 'Mystères Lumineux',
    latin: 'Mysteria Luminosa',
    days: [4],
    daysLabel: 'Jeudi',
    mysteries: [
      {
        title: 'Le Baptême de Jésus au Jourdain',
        fruit: 'La fidélité aux promesses du baptême',
        reference: 'Mt 3, 13-17',
        meditation:
          'Le Christ descend dans les eaux ; les cieux s’ouvrent : « Celui-ci est mon Fils bien-aimé. » Renouvelons la grâce de notre baptême et vivons en enfants de Dieu.',
      },
      {
        title: 'Les Noces de Cana',
        fruit: 'La confiance en l’intercession de Marie',
        reference: 'Jn 2, 1-12',
        meditation:
          '« Ils n’ont plus de vin. » Marie voit le manque et le confie à son Fils : « Tout ce qu’il vous dira, faites-le. » Remettons-lui nos pénuries cachées.',
      },
      {
        title: 'L’Annonce du Royaume et l’appel à la conversion',
        fruit: 'La conversion du cœur',
        reference: 'Mc 1, 14-15',
        meditation:
          '« Les temps sont accomplis : le règne de Dieu est tout proche. Convertissez-vous et croyez à l’Évangile. » Laissons le Seigneur retourner notre cœur.',
      },
      {
        title: 'La Transfiguration',
        fruit: 'Le désir de la sainteté',
        reference: 'Lc 9, 28-36',
        meditation:
          'Sur la montagne, le visage de Jésus devient éclatant. « Écoutez-le. » Gardons la mémoire de cette lumière pour traverser les heures sombres.',
      },
      {
        title: 'L’Institution de l’Eucharistie',
        fruit: 'L’adoration et l’amour de l’Eucharistie',
        reference: 'Lc 22, 14-20',
        meditation:
          '« Ceci est mon corps, livré pour vous. » Au soir du Jeudi saint, Jésus se donne jusqu’au bout. Approchons-nous de lui avec foi et action de grâce.',
      },
    ],
  },
  {
    id: 'douloureux',
    name: 'Mystères Douloureux',
    latin: 'Mysteria Dolorosa',
    days: [2, 5],
    daysLabel: 'Mardi & Vendredi',
    mysteries: [
      {
        title: 'L’Agonie de Jésus au Jardin des Oliviers',
        fruit: 'La conformité à la volonté de Dieu',
        reference: 'Lc 22, 39-46',
        meditation:
          'Dans l’angoisse, sa sueur devient comme des gouttes de sang : « Que ta volonté soit faite, non la mienne. » Veillons et prions avec lui.',
      },
      {
        title: 'La Flagellation',
        fruit: 'La pureté et la maîtrise de soi',
        reference: 'Jn 19, 1',
        meditation:
          'Pilate fait flageller Jésus. Par ses blessures, nous sommes guéris. Offrons nos souffrances et demandons la grâce d’un cœur pur.',
      },
      {
        title: 'Le Couronnement d’épines',
        fruit: 'L’humilité et le courage moral',
        reference: 'Mt 27, 27-31',
        meditation:
          'Les soldats tressent une couronne d’épines et se moquent : « Salut, roi des Juifs ! » Le Roi véritable se tait. Apprenons de lui la douceur sous l’humiliation.',
      },
      {
        title: 'Le Portement de la Croix',
        fruit: 'La patience dans les épreuves',
        reference: 'Lc 23, 26-32',
        meditation:
          'Jésus avance vers le Calvaire ; Simon de Cyrène l’aide à porter sa croix. Portons la nôtre avec lui, et aidons nos frères à porter la leur.',
      },
      {
        title: 'Le Crucifiement et la Mort de Jésus',
        fruit: 'Le pardon et la persévérance',
        reference: 'Jn 19, 25-30',
        meditation:
          '« Père, pardonne-leur. » Près de la croix se tient Marie, sa mère. « Tout est accompli. » Recevons-la chez nous, comme le disciple bien-aimé.',
      },
    ],
  },
  {
    id: 'glorieux',
    name: 'Mystères Glorieux',
    latin: 'Mysteria Gloriosa',
    days: [0, 3],
    daysLabel: 'Mercredi & Dimanche',
    mysteries: [
      {
        title: 'La Résurrection',
        fruit: 'La foi',
        reference: 'Mt 28, 1-10',
        meditation:
          '« Il n’est pas ici, il est ressuscité. » Au matin de Pâques, la pierre est roulée et la mort vaincue. Laissons la joie pascale renouveler notre foi.',
      },
      {
        title: 'L’Ascension',
        fruit: 'L’espérance et le désir du Ciel',
        reference: 'Ac 1, 6-11',
        meditation:
          'Jésus est élevé au ciel sous les yeux des Apôtres : « Je suis avec vous tous les jours. » Gardons les yeux fixés vers la demeure qu’il nous prépare.',
      },
      {
        title: 'La Pentecôte',
        fruit: 'Le zèle et les dons de l’Esprit Saint',
        reference: 'Ac 2, 1-13',
        meditation:
          'Réunis avec Marie au Cénacle, les disciples reçoivent l’Esprit comme des langues de feu. Viens, Esprit Saint, embrase nos cœurs et fais de nous des témoins.',
      },
      {
        title: 'L’Assomption de Marie',
        fruit: 'La grâce d’une sainte mort',
        reference: 'Ap 12, 1 ; Lc 1, 48-49',
        meditation:
          'Au terme de sa vie terrestre, Marie est élevée corps et âme dans la gloire. Elle nous précède là où nous sommes attendus.',
      },
      {
        title: 'Le Couronnement de Marie',
        fruit: 'La confiance en Marie et la persévérance finale',
        reference: 'Ap 12, 1',
        meditation:
          '« Une femme, vêtue du soleil, couronnée de douze étoiles. » Reine du ciel et de la terre, Marie veille sur ses enfants. Confions-lui notre route jusqu’au bout.',
      },
    ],
  },
];

export function getSet(id: MysterySetId): MysterySet {
  return MYSTERY_SETS.find((s) => s.id === id) ?? MYSTERY_SETS[0];
}

export function getSetForDate(date = new Date()): MysterySet {
  const day = date.getDay();
  return MYSTERY_SETS.find((s) => s.days.includes(day)) ?? MYSTERY_SETS[0];
}

export const ORDINALS = ['1ᵉʳ', '2ᵉ', '3ᵉ', '4ᵉ', '5ᵉ'];
