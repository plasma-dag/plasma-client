"use-strict";

class User {
  // IP address를 현재는 저장하게 만들어 놓음
  // 나중에는 DNS 서버에 쿼리를 보내느 방식이 될 수 있을 것.
  constructor(id, addr, ip) {
    this.id = id;
    this.addr = addr;
    this.ip = ip;
  }
}

module.exports = {
  User
};
