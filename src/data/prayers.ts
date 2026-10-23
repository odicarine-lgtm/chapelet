export type Lang = 'fr' | 'la';

export type PrayerId =
  | 'pater'
  | 'ave'
  | 'gloria'
  | 'fatima'
  | 'salve'
  | 'benediction'
  // Chapelet de la Divine Miséricorde
  | 'signeCroix'
  | 'sangEau'
  | 'credo'
  | 'pereEternel'
  | 'parSaPassion'
  | 'dieuSaint'
  | 'finaleMisericorde'
  | 'jesusConfiance';

interface Prayer {
  title: Record<Lang, string>;
  text: Record<Lang, string>;
}

export const PRAYERS: Record<PrayerId, Prayer> = {
  pater: {
    title: { fr: 'Notre Père', la: 'Pater Noster' },
    text: {
      fr: "Notre Père, qui es aux cieux, que ton nom soit sanctifié, que ton règne vienne, que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd'hui notre pain de ce jour. Pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés. Et ne nous laisse pas entrer en tentation, mais délivre-nous du Mal. Amen.",
      la: 'Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.',
    },
  },
  ave: {
    title: { fr: 'Je vous salue Marie', la: 'Ave Maria' },
    text: {
      fr: 'Je vous salue, Marie, pleine de grâce ; le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes, et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pauvres pécheurs, maintenant et à l’heure de notre mort. Amen.',
      la: 'Ave Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.',
    },
  },
  gloria: {
    title: { fr: 'Gloire au Père', la: 'Gloria Patri' },
    text: {
      fr: 'Gloire au Père, et au Fils, et au Saint-Esprit, comme il était au commencement, maintenant et toujours, pour les siècles des siècles. Amen.',
      la: 'Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc et semper, et in saecula saeculorum. Amen.',
    },
  },
  fatima: {
    title: { fr: 'Prière de Fatima', la: 'Oratio Fatimae' },
    text: {
      fr: 'Ô mon Jésus, pardonnez-nous nos péchés, préservez-nous du feu de l’enfer, et conduisez au ciel toutes les âmes, surtout celles qui ont le plus besoin de votre miséricorde.',
      la: 'O mi Iesu, dimitte nobis debita nostra, libera nos ab igne inferni, conduc in caelum omnes animas, praesertim illas quae maxime indigent misericordia tua.',
    },
  },
  salve: {
    title: { fr: 'Salve Regina', la: 'Salve Regina' },
    text: {
      fr: 'Salut, ô Reine, Mère de miséricorde, notre vie, notre douceur, notre espérance, salut ! Enfants d’Ève exilés, nous crions vers vous ; vers vous nous soupirons, gémissant et pleurant dans cette vallée de larmes. Ô vous, notre avocate, tournez vers nous vos regards miséricordieux. Et, après cet exil, montrez-nous Jésus, le fruit béni de vos entrailles. Ô clémente, ô miséricordieuse, ô douce Vierge Marie.\n℣. Priez pour nous, sainte Mère de Dieu.\n℟. Afin que nous soyons rendus dignes des promesses du Christ.',
      la: 'Salve, Regina, Mater misericordiae, vita, dulcedo, et spes nostra, salve. Ad te clamamus, exsules filii Hevae. Ad te suspiramus, gementes et flentes in hac lacrimarum valle. Eia ergo, advocata nostra, illos tuos misericordes oculos ad nos converte. Et Iesum, benedictum fructum ventris tui, nobis post hoc exsilium ostende. O clemens, O pia, O dulcis Virgo Maria.\n℣. Ora pro nobis, sancta Dei Genetrix.\n℟. Ut digni efficiamur promissionibus Christi.',
    },
  },
  benediction: {
    title: { fr: 'Bénédiction', la: 'Benedictio' },
    text: {
      fr: 'Par l’intercession de la bienheureuse Vierge Marie, que le Dieu tout-puissant nous bénisse et nous garde : le Père, le Fils et le Saint-Esprit. Amen.',
      la: 'Per intercessionem beatae Mariae semper Virginis, benedicat nos omnipotens Deus, Pater, et Filius, et Spiritus Sanctus. Amen.',
    },
  },
  signeCroix: {
    title: { fr: 'Signe de croix', la: 'Signum Crucis' },
    text: {
      fr: 'Au nom du Père, et du Fils, et du Saint-Esprit. Amen.',
      la: 'In nomine Patris, et Filii, et Spiritus Sancti. Amen.',
    },
  },
  sangEau: {
    title: { fr: 'Ô Sang et Eau', la: 'O Sanguis et Aqua' },
    text: {
      fr: 'Ô Sang et Eau qui avez jailli du Cœur de Jésus comme source de miséricorde pour nous, j’ai confiance en Vous !',
      la: 'O Sanguis et Aqua, qui ex Corde Iesu ut fons misericordiae pro nobis emanasti, confido in te.',
    },
  },
  credo: {
    title: { fr: 'Je crois en Dieu', la: 'Credo' },
    text: {
      fr: 'Je crois en Dieu, le Père tout-puissant, créateur du ciel et de la terre. Et en Jésus-Christ, son Fils unique, notre Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers, le troisième jour est ressuscité des morts, est monté aux cieux, est assis à la droite de Dieu le Père tout-puissant, d’où il viendra juger les vivants et les morts. Je crois en l’Esprit-Saint, à la sainte Église catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Amen.',
      la: 'Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae. Et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.',
    },
  },
  pereEternel: {
    title: { fr: 'Père Éternel', la: 'Pater aeterne' },
    text: {
      fr: 'Père Éternel, je T’offre le Corps et le Sang, l’Âme et la Divinité de Ton Fils bien-aimé, notre Seigneur Jésus-Christ, en réparation de nos péchés et de ceux du monde entier.',
      la: 'Pater aeterne, offero tibi Corpus et Sanguinem, Animam et Divinitatem dilectissimi Filii tui, Domini nostri Iesu Christi, in propitiationem pro peccatis nostris et totius mundi.',
    },
  },
  parSaPassion: {
    title: { fr: 'Par sa douloureuse Passion', la: 'Pro dolorosa passione' },
    text: {
      fr: 'Par Sa douloureuse Passion, sois miséricordieux pour nous et pour le monde entier.',
      la: 'Pro dolorosa eius passione, miserere nobis et totius mundi.',
    },
  },
  dieuSaint: {
    title: { fr: 'Dieu Saint', la: 'Sanctus Deus' },
    text: {
      fr: 'Dieu Saint, Dieu Fort, Dieu Immortel, prends pitié de nous et du monde entier.',
      la: 'Sanctus Deus, Sanctus Fortis, Sanctus Immortalis, miserere nobis et totius mundi.',
    },
  },
  finaleMisericorde: {
    title: { fr: 'Prière finale', la: 'Oratio conclusiva' },
    text: {
      fr: 'Ô Dieu éternel, dont la miséricorde est insondable et le trésor de compassion inépuisable, pose sur nous un regard favorable et multiplie en nous Ta miséricorde, afin que dans les moments difficiles nous ne désespérions pas et ne perdions pas courage, mais que nous nous soumettions avec une grande confiance à Ta sainte volonté, qui est l’Amour et la Miséricorde même. Amen.',
      la: 'Aeterne Deus, cuius misericordia est infinita et thesaurus miserationis inexhaustus, respice propitius in nos et auge in nobis misericordiam tuam, ut in rebus difficilibus non desperemus neque animo deficiamus, sed cum magna fiducia voluntati tuae sanctae, quae est ipse Amor et Misericordia, nos subiciamus. Amen.',
    },
  },
  jesusConfiance: {
    title: { fr: 'Jésus, j’ai confiance en Toi', la: 'Iesu, in te confido' },
    text: {
      fr: 'Jésus, j’ai confiance en Toi !',
      la: 'Iesu, in te confido.',
    },
  },
};

