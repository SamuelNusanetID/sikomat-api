import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export interface IGetUserAuthInfoRequest extends Request {
  user: any // or any other type
}

export const checkJwt = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })

};

// const jwt = require('jsonwebtoken');
// export const checkJwt = function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (token == null) return res.sendStatus(401)
//   jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
//     console.log(err)
//     if (err) return res.sendStatus(403)
//     req.user = user
//     next()
//   })
// }