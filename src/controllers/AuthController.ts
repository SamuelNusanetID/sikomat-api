import { getCustomRepository, IsNull, LessThan, MoreThan, Not } from "typeorm";
import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";

import { Auth } from "../entity/Auth";
import { Verify } from "../entity/Verify";

import { UserRepository } from "../repositories/UserRepository";
import { BidanRepository } from "../repositories/BidanRepository";
import { SuperUserRepository } from "../repositories/SuperUserRepository";
const jwt = require("jsonwebtoken");
const date = require("date-and-time");
const requestIp = require("request-ip");
require("dotenv").config();
const moment = require("moment");
const axios = require("axios");
const bcrypt = require("bcryptjs");

export interface IGetUserAuthInfoRequest extends Request {
  user: any // or any other type
}

export class AuthController {
  private userRepository = getCustomRepository(UserRepository);
  private suRepository = getCustomRepository(SuperUserRepository);
  private bidanRepo = getCustomRepository(BidanRepository);
  private authRepository = getRepository(Auth);
  private verifyRepo = getRepository(Verify);

  async login(request: Request, response: Response, next: NextFunction) {
    const username = request.body.username;
    const password = request.body.password;

    let userFetch = await this.userRepository.findByHp(username);

    if (userFetch != null) {
      if (bcrypt.compareSync(password, userFetch.password)) {
        if (userFetch.status == 1 && userFetch.activation_date != null) {
          const now = new Date();
          const token = await this.generateAccessToken({
            username: userFetch.hp,
          });
          let auth = {
            created: now,
            expired: date.addDays(now, 365),
            id: userFetch.id,
            ip: requestIp.getClientIp(request),
            platform: request.headers["user-agent"],
            user_type: "bidan",
            username: userFetch.hp,
            token: token,
          };
          await this.authRepository.save(auth);
          if (userFetch.user_type == "bidan") {
            let bidan = await this.bidanRepo.findByHp(userFetch.hp);
            return {
              token: token,
              msg: "Berhasil Login",
              user: userFetch,
              bidan: bidan,
              success: true,
            };
          } else {
            return {
              token: token,
              msg: "Berhasil Login",
              user: userFetch,
              success: true,
            };
          }
        } else {
          return {
            token: "",
            msg: "Akun anda belum diaktivasi oleh Admin!",
            user: {},
            status: 200,
            success: false,
            bidan: {},
          };
        }
      } else {
        return {
          token: "",
          msg: "Username atau Password Salah!",
          user: {},
          status: 200,
          success: false,
          bidan: {},
        };
      }
    } else {
      return {
        token: "",
        msg: "Akun anda belum terdaftar!",
        user: {},
        status: 200,
        success: false,
        bidan: {},
      };
    }
  }

  async register(request: Request, response: Response, next: NextFunction) {
    const { nama, hp, password, fcm_token, alamat_detail } = request.body;

    let token = "";

    // Password Hashing
    var salt = bcrypt.genSaltSync(10);
    var hashPassword = bcrypt.hashSync(password, salt);

    // Save Data to User Tabel
    try {
      token = await this.generateAccessToken({ hp: hp });
      let now = new Date();
      let savedDataPasien = await this.userRepository.insert({
        nama: nama,
        hp: hp,
        password: hashPassword,
        email: null,
        user_type: "bidan",
        status: 1,
        fcm_token: fcm_token,
        activation_request_date: moment(now).format("YYYY-MM-DD HH:mm:ss"),
        activation_date: moment(now).format("YYYY-MM-DD HH:mm:ss")
      });
      console.log(savedDataPasien);

      let savedDataBidan = await this.bidanRepo.insert({
        nama: nama,
        hp: hp,
        email: null,
        alamat_detail: alamat_detail,
        rekanan: "ibi",
      });
      console.log(savedDataBidan);

      return {
        token: token,
        msg: "Registrasi berhasil!",
        user: await this.userRepository.findOne(savedDataPasien.raw[0].id),
        status: 200,
        success: true,
        bidan: await this.bidanRepo.findByHp(hp),
      };
    } catch (error) {
      return {
        token: token,
        msg: error.detail,
        user: {},
        status: 404,
        success: false,
        bidan: {},
      };
    }
  }

  async checkToken(request: IGetUserAuthInfoRequest, response: Response, next: NextFunction) {
    if (Date.now() >= request.user.exp * 1000) {
      return {
        msg: "Token Expired, Login Ulang",
        status: 200,
        success: true,
        expired: true,
      };
    } else {
      return { msg: "OK", status: 200, success: true, expired: false };
    }
  }

  async loginAdmin(request: Request, response: Response, next: NextFunction) {
    let user = await this.userRepository.findOne({ hp: request.body["hp"] });
    let token = "";
    if (user != null) {
      const now = new Date();
      token = await this.generateAccessToken({ hp: request.body["username"] });
      let auth = {
        created: now,
        expired: date.addDays(now, 365),
        id: user.id,
        ip: requestIp.getClientIp(request),
        platform: request.body["platform"],
        refresh_token: token,
        token: token,
        userType: "bidan",
        hp: user.hp,
      };

      return auth;
    }
    return { token: "", message: "User tidak ditemukan" };
  }

  async generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, {
      expiresIn: "180000000s",
    });
  }
}
