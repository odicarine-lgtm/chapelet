export type Lang = 'fr' | 'la';

export type PrayerId = 'pater' | 'ave' | 'gloria' | 'fatima' | 'salve' | 'benediction';

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
};

/** Numéro de grain (0 à 11) → prières à réciter. */
export function prayersForStep(step: number): PrayerId[] {
  if (step === 0) return ['pater'];
  if (step === 11) return ['gloria', 'fatima'];
  return ['ave'];
}
