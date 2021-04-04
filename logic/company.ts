import {IGame} from '../models/game';

export function getOrderedUnownedBiddables(game: IGame): any[] {
  const biddables: any[] = [];
  game.privateCompanyMap.forEach(c => biddables.push(c));
  game.minorCompanyMap.forEach(c => biddables.push(c));
  return biddables.sort((c1, c2) => c1.bidOrder - c2.bidOrder)
    .filter(c => c.owningPlayerNumber === -1);
}
