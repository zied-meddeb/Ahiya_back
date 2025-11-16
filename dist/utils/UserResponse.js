"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponse = void 0;
class UserResponse {
    _id;
    nom;
    email;
    token;
    constructor(user) {
        this._id = user._id;
        this.nom = user.nom;
        this.email = user.email;
        this.token = user.token;
    }
    toJSON() {
        return {
            id: this._id,
            nom: this.nom,
            email: this.email,
            token: this.token
        };
    }
}
exports.UserResponse = UserResponse;
//# sourceMappingURL=UserResponse.js.map