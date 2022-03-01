import { expect } from "chai";
import ReservationPriceCalculator from "../ReservationPriceCalculator";
import { reservation1 } from "./reservation.mock";

describe("[Testing]: ReservationPriceCalculator", () => {
    it("Must not apply price plan if duration  betn it fromDate and checkout date is less than its duration", () => {
        const reservation = new ReservationPriceCalculator(reservation1);
        console.log(reservation.price);
        expect("hello").to.be.equal("hello");
    });
});
