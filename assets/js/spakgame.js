/**
 * JavaScript-Datei für Spakgame.
 * @copyright 1999-2025 by Niederrhein Studio <niederrhein.studio>
 * @author    Sascha Schneider <sc@niederrhein.studio>
 * @version   25.7.11
 * @license   AGPL-3.0 only, see LICENSE.txt in root directory.
 * @requires  jQuery
 */

class Spakgame {
    
    /**
     * Gewürfelter Wert der fünf Würfel (1-6)
     */
    diceValue = [1,2,3,4,5]

    /**
     * Halte-Status der fünf Würfel (true = gehalten, false = nicht gehalten)
     */
    hold = [false,false,false,false,false]

    /**
     * Anzahl der bisherigen Würfe in der aktuellen Runde
     */
    throwCount = 0

    /** 
     * Maximale Anzahl an Würfen je Runde
     */
    maxThrows = 4

    /** 
     * Aktuelle Runde
     */
    round = 1

    /**
     * Zwischensumme der Einser bis Sechser
     */
    sum1 = 0

    /**
     * Zwischensumme der Sonderpunkte
     */
    sum2 = 0

    /**
     * Bonus für Zwischensumme 1
     */
    spakbonus = 0

    /**
     * Für Spakbonus genug Punkte erreicht
     */
    isSpakbonus = false

    /** 
     * Endsumme
     */
    finalSum = 0

    /**
     * Punkte für Einser bis Sechser
     */
    rolledValues = [0,0,0,0,0,0]

    /** 
     * Punkte für Rue de la Spak
     */
    pointsRueDeLaSpak = 0

    /** 
     * Punkte für Sturmfreie Bude
     */
    pointsSturmfreieBude = 0

    /**
     * Punkte für Megaspak
     */
    pointsMegaspak = 0

    /**
     * Punkte für Viererspak
     */
    pointsSpak4 = 0

    /**
     * Punkte für Dreierspak
     */
    pointsSpak3 = 0 

    /**
     * Punkte für Schnorrer
     */
    pointsAll = 0
    
    /**
     * Konstruktor der Spakgame-Klasse. Initialisiert ein neues Spiel.
     */
    constructor() {
        this.newGame()
    }

    /** 
     * Zählt, wie oft ein bestimmter Würfelwert geworfen wurde.
     * @param {number} diceRollValue - Der Würfelwert (1-6)
     * @returns {number} - Die Anzahl der Vorkommen des Würfelwerts
     */
    countDiceRollValue(diceRollValue) { 
        let count = 0;
        for (var i=0;i<=4;i++) {
            if (diceRollValue == this.diceValue[i]) {
                count++;
            }
        }
        return count;
    }

    checkGameOver() {
        // Noch nicht alle Würfe verbraucht
        if (this.throwCount < this.maxThrows) {
            return 
        }

        // Prüfe, ob alle Punkte vergeben wurden.
        let buttonsLeft = false

        // Prüfe die Buttons für Einser bis Sechser
        for (var i=1;i<=6;i++) {
            if ( (!$("#buttonR" + i).hasClass("d-none")) 
                    && (!$("#buttonR" + i).prop("disabled")) ) {
                buttonsLeft = true
            }
        }

        // Prüfe den Rue de la Spak Button
        if (!$("#buttonRueDeLaSpak").prop("disabled")) {
            buttonsLeft = true
        }

        // Prüfe den Sturmfreie Bude Button
        if (!$("#buttonSturmfreieBude").prop("disabled")) {
            buttonsLeft = true
        }

        // Prüfe den Megaspak Button
        if (!$("#buttonMegaspak").prop("disabled")) {
            buttonsLeft = true
        }

        // Prüfe den Viererspak Button
        if ( (!$("#buttonSpak4").hasClass("d-none")) 
                && (!$("#buttonSpak4").prop("disabled")) ) {
            buttonsLeft = true
        }

        // Prüfe den Dreierspak Button
        if ( (!$("#buttonSpak3").hasClass("d-none")) 
                && (!$("#buttonSpak3").prop("disabled")) ) {
            buttonsLeft = true
        }

        // Prüfe den Schnorrer Button
        if (!$("#buttonAll").hasClass("d-none")) {
            buttonsLeft = true
        }

        // Wenn keine Punkte mehr gesetzt werden können, ist das Spiel vorbei.
        if (!buttonsLeft) {
            $("#final-points").text(this.finalSum)
            $("#final-rounds").text(this.round)
            $("#modal-game-over").modal("show")
        }
    }

    /**
     * Generiert den Spakbonus, wenn die Bedingungen erfüllt sind.
     */
    generateSpakbonus() {
        if (this.isSpakbonus) {
            this.spakbonus+= 80
            this.maxThrows++
            $("#modal-spakbonus-trys").text(this.maxThrows)
            $("#modal-spakbonus").modal("show")
        } 
    }

    /**
     * Generiert die Summen und aktualisiert die Anzeige.
     */
    generateSum() {
        // Summe Einser bis Sechser
        this.sum1 = 0
        for (var i=0;i<=5;i++) {
            this.sum1 += this.rolledValues[i]
        }
        $("#inputSum1").val(this.sum1)
        if (this.sum1 >= 50) {
            this.isSpakbonus = true
        }

        // Spakbonus
        $("#inputSpakbonus").val(this.spakbonus)

        // Summe Sonderpunkte
        this.sum2 = this.pointsRueDeLaSpak + 
            this.pointsSturmfreieBude +
            this.pointsMegaspak +
            this.pointsSpak4 +
            this.pointsSpak3 +
            this.pointsAll
        $("#inputSum2").val(this.sum2)

        // Endsumme
        this.finalSum = this.sum1 + this.sum2 + this.spakbonus
        $("#inputFinalSum").val(this.finalSum)
    }

    /**
     * Halte oder löse den Halt eines Würfels.
     * @param {number} index - Index des Würfels (0-4)
     */
    holdDice(index) {
        this.hold[index] = !this.hold[index]
        this.updateDice()
    }

    /**
     * Überprüft, ob Würfe vom Wert vorhanden sind.
     * @param {*} value - Der zu überprüfende Wert
     */
    isRolledValue(value) {
        for (var i=0;i<=4;i++) {
            if (this.diceValue[i] == value) {
                return true
            }
        }
        return false
    }

    /** 
     * Setzt den gewürfelten Wert und aktualisiert die Punkte.
     * @param {number} value - Der gewürfelte Wert (1-6)
     */
    setRolledValue(value) {
        let points = this.countDiceRollValue(value) * value
        this.rolledValues[value - 1] = points
        $("#buttonR" + value).addClass("d-none")
        $("#inputR" + value).val(points)
        this.generateSum()
        this.generateSpakbonus()
        this.generateSum() // Aktualisiere die Summe nochmal nach dem Spakbonus
        this.newRound()
    }

    /**
     * Überprüft, ob die Straße (1,2,3,4,5) oder (2,3,4,5,6) geworfen wurde.
     * @returns boolean
     */
    isRueDeLaSpak() {
        // Prüfe, ob die Straße (2,3,4,5) geworfen wurde. Auf 1 oder 6 wird
        // nicht geachtet, da bei 2,3,4,5 nur noch 1 oder 6 übrig bleiben 
        // können.
        return (this.countDiceRollValue(2) == 1) &&
            (this.countDiceRollValue(3) == 1) &&
            (this.countDiceRollValue(4) == 1) &&
            (this.countDiceRollValue(5) == 1)
    }

    /**
     * Setzt die Punkte für Rue de la Spak.
     */
    setRueDeLaSpak() {
        this.pointsRueDeLaSpak += 150
        $("#inputRueDeLaSpak").val(this.pointsRueDeLaSpak)
        this.sum2 += this.pointsRueDeLaSpak
        this.generateSum()
        this.newRound()
    }

    /**
     * Überprüft, ob Sturmfreie Bude (2 Gleiche + 3 Gleiche) geworfen wurde.
     * @returns boolean
     */
    isSturmfreieBude() {
        let ok2, ok3 = false
        for (var i=1;i<=6;i++) {
            if (this.countDiceRollValue(i) == 2) {ok2 = true}
            if (this.countDiceRollValue(i) == 3) {ok3 = true}
        }
        return ok2 && ok3
    }

    /** 
     * Setzt die Punkte für Sturmfreie Bude.
     */
    setSturmfreieBude() {
        this.pointsSturmfreieBude += 40
        $("#inputSturmfreieBude").val(this.pointsSturmfreieBude)
        this.sum2 += this.pointsSturmfreieBude
        this.generateSum()
        this.newRound()
    }

    /** 
     * Setzt die Punkte für Megaspak.
     */
    setMegaspak() {
        this.pointsMegaspak += 100
        $("#inputMegaspak").val(this.pointsMegaspak)
        this.sum2 += this.pointsMegaspak
        this.generateSum()
        this.newRound()
    }

    /** 
     * Setzt die Punkte für Viererspak.
     */
    setSpak4() {
        this.pointsSpak4 = this.getSumOfAllDice()
        $("#inputSpak4").val(this.pointsSpak4)
        $("#buttonSpak4").addClass("d-none")
        this.sum2 += this.pointsSpak4
        this.generateSum()
        this.newRound()
    }

    /** 
     * Setzt die Punkte für Dreierspak.
     */
    setSpak3() {
        this.pointsSpak3 = this.getSumOfAllDice()
        $("#inputSpak3").val(this.pointsSpak3)
        $("#buttonSpak3").addClass("d-none")
        this.sum2 += this.pointsSpak3
        this.generateSum()
        this.newRound()
    }

    /** 
     * Setzt die Punkte für Schnorrer.
     */
    setAll() {
        this.pointsAll = this.getSumOfAllDice()
        $("#inputAll").val(this.pointsAll)
        $("#buttonAll").addClass("d-none")
        this.sum2 += this.pointsAll
        this.generateSum()
        this.newRound()
    }

    /**
     * Überprüft, ob die in count mindestens angegebene Anzahl gleicher Würfe 
     * geworfen wurden.
     * @param {*} count 
     * @returns 
     */
    isSameValueCount(count) {
        for (var i=1;i<=6;i++) {
            if (this.countDiceRollValue(i) >= count) {
                return true
            }
        }
        return false
    }

    /** 
     * Berechnet die Summe aller Würfelwerte.
     * @returns number - Die Summe aller Würfelwerte
     */
    getSumOfAllDice() {
        let sum = 0
        for (var i=0;i<=4;i++) {
            sum += this.diceValue[i]
        }
        return sum
    }

    /**
     * Startet ein neues Spiel. Setzt alle Werte zurück.
     */
    newGame() {
        this.diceValue = [1,2,3,4,5]
        this.hold = [false,false,false,false,false]
        this.throwCount = 0
        this.maxThrows = 4 //@TODO Nach debug wieder auf 4 setzen!!!
        this.round = 1
        this.sum1 = 0
        this.sum2 = 0
        this.spakbonus = 0
        this.isSpakbonus = false
        this.finalSum = 0
        this.updateDice()
        this.updateRollTheDiceButton()
        this.rollTheDice()

        // Punkte für Einser bis Sechser zurücksetzen
        this.rolledValues = [0,0,0,0,0,0]
        for (var i=1;i<=6;i++) {
            $("#buttonR" + i).removeClass("d-none")
            $("#inputR" + i).val("")
        }

        //  Rue de la Spak zurücksetzen
        this.pointsRueDeLaSpak = 0
        $("#inputRueDeLaSpak").val("")

        // Sturmfreie Bude zurücksetzen
        this.pointsSturmfreieBude = 0
        $("#inputSturmfreieBude").val("")

        // Megaspak zurücksetzen
        this.pointsMegaspak = 0
        $("#inputMegaspak").val("")

        // Viererspak zurücksetzen
        this.pointsSpak4 = 0
        $("#inputSpak4").val("") 
        $("#buttonSpak4").removeClass("d-none")   

        // Dreierspak zurücksetzen
        this.pointsSpak3 = 0
        $("#inputSpak3").val("")
        $("#buttonSpak3").removeClass("d-none")

        // Schnorrer zurücksetzen
        this.pointsAll = 0
        $("#inputAll").val("")
        $("#buttonAll").removeClass("d-none")

        this.generateSum()

        $("#round-counter").html("Runde " + this.round)
    }

    /**
     * Startet eine neue Runde. Setzt den Wurfzähler und den Halt-Status 
     * zurück.
     */
    newRound() {
        this.round++
        this.throwCount = 0
        this.hold = [false,false,false,false,false]
        this.rollTheDice()
        $("#round-counter").html("Runde " + this.round)
    }

    /**
     * Aktualisiert die Anzeige der Würfel basierend auf ihrem Halt-Status.
     */
    updateDice() {
        for (var i=0;i<=4;i++) {
            if (this.hold[i]) { 
                $('#dice' + i).
                    attr('src','assets/img/w' + this.diceValue[i] + 'h.svg')
            } else {
                $('#dice' + i).
                    attr('src','assets/img/w' + this.diceValue[i] + '.svg')
            }    
        }
    }

    /**
     * Aktualisiert die Beschriftung und Farbe des Würfel-Buttons.
     */
    updateRollTheDiceButton() {
        // Aktualisiert die Anzeige des Wurfzählers.
        $('#roll-the-dice-counter').html(
            this.throwCount + " von " + this.maxThrows
        )
        // Deaktiviert den Würfel-Button, wenn die maximale Anzahl an 
        // Würfen erreicht ist.
        $('#button-roll-the-dice').prop(
            'disabled',
            this.throwCount >= this.maxThrows
        )
        // Entfernt alle Farbklassen vom Button.
        $('#button-roll-the-dice').removeClass('btn-primary')
            .removeClass('btn-warning')
            .removeClass('btn-danger')
        // Setzt die Farbe des Buttons basierend auf der Anzahl der Würfe.
        if (this.throwCount == this.maxThrows) { // Alle Würfe verbraucht
            $('#button-roll-the-dice').addClass('btn-danger')
        } else if (this.throwCount == this.maxThrows - 1) { // Letzter Wurf
            $('#button-roll-the-dice').addClass('btn-warning')
        } else { // Noch genug Würfe übrig
            $('#button-roll-the-dice').addClass('btn-primary')
        }
    }

    /**
     * Würfeln. Berücksichtigt dabei ob der Würfel gehalten ist (hold[x]).
     */
    rollTheDice() {
        for (var i=0;i<=4;i++) {
            if (!this.hold[i]) {
                var min = 1
                var max = 6
                this.diceValue[i] = Math.floor(Math.random() * 
                    (max - min + 1)) + min
            }
        }
        this.updateDice()
        this.throwCount++
        this.updateRollTheDiceButton()

        // Aktualisiere die Verfügbarkeit der Punkte-Buttons.
        for (var i=1;i<=6;i++) {
            $('#buttonR' + i).attr('disabled',!this.isRolledValue(i))
        }
        $('#buttonRueDeLaSpak').attr('disabled',!this.isRueDeLaSpak())
        $('#buttonSturmfreieBude').attr('disabled',!this.isSturmfreieBude())
        $('#buttonMegaspak').attr('disabled',!this.isSameValueCount(5))
        $('#buttonSpak4').attr('disabled',!this.isSameValueCount(4))
        $('#buttonSpak3').attr('disabled',!this.isSameValueCount(3))
        // Schnorrer-Button ist immer verfügbar, wenn noch nicht gesetzt.

        // Prüfe ob Spiel vorbei ist
        this.checkGameOver() 
    }

}

// Warte, bis das DOM vollständig geladen ist.
$(()=>{

    // Erstelle eine Instanz der Spakgame-Klasse.
    let spakgame = new Spakgame()

    // Starte ein neues Spiel, wenn auf den "Neues Spiel"-Button geklickt
    // wird. Sollte das Spiel schon in der 2. Runde oder höher sein, wird
    // ein Bestätigungs-Modal angezeigt.
    $("#button-new-game").click(()=>{
        if(spakgame.round < 2) {
            spakgame.newGame()
        } else {
            $("#modal-new-game").modal("show")
        }
        
    })

    // Starte ein neues Spiel, wenn auf den "Neues Spiel"-Button im Modal 
    // „Game over“ geklickt wird.
    $("#modal-button-new-game").click(()=>{
        spakgame.newGame()
        $("#modal-game-over").modal("hide")
    })

    // Starte ein neues Spiel, wenn auf den "Neues Spiel"-Button im Modal 
    // „Neues Spiel“ geklickt wird.
    $("#button-confirmed-new-game").click(()=>{
        spakgame.newGame()
        $("#modal-new-game").modal("hide")
    })

    // Würfelt, wenn auf den Würfeln-Button geklickt wird.
    $("#button-roll-the-dice").click(()=>{spakgame.rollTheDice()})

    // Öffne den "About-Dialog", wenn auf den entsprechenden Menüpunkt geklickt
    // wird.
    $("#menu-about").click(()=>{$("#modal-about").modal("show")})

    // Öffne den "Spielregeln-Dialog", wenn auf den entsprechenden Menüpunkt 
    // geklickt wird.
    $("#menu-rules-of-the-game").click(()=>{
        $("#modal-rules-of-the-game").modal("show")
    })

    // Halte oder löse den Halt des ersten Würfels, wenn auf das Würfelbild 
    // geklickt wird.
    $("#dice0").click(()=>{spakgame.holdDice(0)})

    // Halte oder löse den Halt des zweiten Würfels, wenn auf das Würfelbild 
    // geklickt wird.
    $("#dice1").click(()=>{spakgame.holdDice(1)})

    // Halte oder löse den Halt des dritten Würfels, wenn auf das Würfelbild 
    // geklickt wird.
    $("#dice2").click(()=>{spakgame.holdDice(2)})

    // Halte oder löse den Halt des vierten Würfels, wenn auf das Würfelbild 
    // geklickt wird.
    $("#dice3").click(()=>{spakgame.holdDice(3)})

    // Halte oder löse den Halt des fünften Würfels, wenn auf das Würfelbild 
    // geklickt wird.
    $("#dice4").click(()=>{spakgame.holdDice(4)})

    // Setze die Punkte für Einser, wenn auf den entsprechenden Button geklickt 
    // wird.
    $("#buttonR1").click(()=>{ 
        spakgame.setRolledValue(1)
    })

    // Setze die Punkte für Zweier, wenn auf den entsprechenden Button geklickt
    // wird.
    $("#buttonR2").click(()=>{ 
        spakgame.setRolledValue(2)
    })

    // Setze die Punkte für Dreier, wenn auf den entsprechenden Button geklickt
    // wird.
    $("#buttonR3").click(()=>{ 
        spakgame.setRolledValue(3)
    })

    // Setze die Punkte für Vierer, wenn auf den entsprechenden Button geklickt
    // wird.
    $("#buttonR4").click(()=>{ 
        spakgame.setRolledValue(4)
    })

    // Setze die Punkte für Fünfer, wenn auf den entsprechenden Button geklickt
    // wird.
    $("#buttonR5").click(()=>{ 
        spakgame.setRolledValue(5)
    })

    // Setze die Punkte für Sechser, wenn auf den entsprechenden Button 
    // geklickt wird.
    $("#buttonR6").click(()=>{ 
        spakgame.setRolledValue(6)
    })

    // Setze die Punkte für Rue de la Spak, wenn auf den entsprechenden Button 
    // geklickt wird.
    $("#buttonRueDeLaSpak").click(()=>{ 
        spakgame.setRueDeLaSpak()
    })

    // Setze die Punkte für Sturmfreie Bude, wenn auf den entsprechenden Button
    // geklickt wird.
    $("#buttonSturmfreieBude").click(()=>{ 
        spakgame.setSturmfreieBude()
    })

    // Setze die Punkte für Megaspak, wenn auf den entsprechenden Button 
    // geklickt wird.
    $("#buttonMegaspak").click(()=>{ 
        spakgame.setMegaspak()
    })

    // Setze die Punkte für Viererspak, wenn auf den entsprechenden Button 
    // geklickt wird.
    $("#buttonSpak4").click(()=>{ 
        spakgame.setSpak4()
    })

    // Setze die Punkte für Dreierspak, wenn auf den entsprechenden Button 
    // geklickt wird.
    $("#buttonSpak3").click(()=>{ 
        spakgame.setSpak3()
    })

    // Setze die Punkte für Schnorrer, wenn auf den entsprechenden Button 
    // geklickt wird.
    $("#buttonAll").click(()=>{ 
        spakgame.setAll()
    })  
})
// Ende spakgame.js