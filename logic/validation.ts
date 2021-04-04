import {IGame} from '../models/game';
import {Response} from '../logic/game';

export function throwInvalidInput(inputValue: any, inputFieldName: string, res: any): any {
  return res.status(400).json({"statusCode": 400,
    "error": "BadRequest",
    "message": `Bad input ${inputFieldName}: ${inputValue}`});
}

export function throwNotPlayerTurn(inputPlayerNumber: number, currentPlayerTurn: number, res: any): any {
  return res.status(400).json({"statusCode": 400,
    "error": "NotPlayerTurn",
    "message": `Current player turn: ${currentPlayerTurn}. Input playerNumber: ${inputPlayerNumber}`});
}

export function getNotEnoughMoneyResponse(inputMoney: number, cost: number): Response {
  return {
    hasRes: true,
    status: 400,
    error: "NotEnoughMoney",
    message: `Amount: ${inputMoney} is not enough to pay for cost: ${cost}.`
  };
}

export function throwGameEnded(game: IGame, res: any): any {
  return res.status(400).json({"statusCode": 400,
    "error": "GameHasEnded",
    "message": `Game ended with winning player: ${game.winningPlayer}`,
    "game": `${game}`
  });
}
