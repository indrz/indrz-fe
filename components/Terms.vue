<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-card>
      <v-card-title class="headline" />
      <v-card-text>
        <h1>Allgemeine Hinweise</h1>
        <p />

        <div>
          <p>
            TUW-maps bietet eine
            einfache grafische Darstellung und begleitende Informationen zu
            Geb&auml;uden, R&auml;umen und Serviceangeboten der Technischen
            Universit&auml;t Wien. Die Applikation arbeitet nicht mit Ihrem
            Standort, sondern basiert ausschlie&szlig;lich auf dem vorhanden
            Kartenmaterial der TU Wien: &Uuml;bersichtspl&auml;ne der
            verschiedenen Campus-Areale, Etagengrundrisse bis hin zu
            Rauminformationen und Belegungspl&auml;nen f&uuml;r H&ouml;rs&auml;le
            und Seminarr&auml;ume, welche mit Daten aus TISS
            <a href="https://tiss.tuwien.ac.at/">https://tiss.tuwien.ac.at/</a>
            erg&auml;nzt werden.
          </p>
          <p>
            Geb&auml;ude, R&auml;ume
            und Personen <!-- Bitte Klärung mit Abteilung Datenschutz & Dokumentenmanagement -->lassen
            sich damit grafisch &uuml;ber den jeweiligen Campus- oder
            Gescho&szlig;plan, bzw. &uuml;ber die Suchfunktion oder als
            Listeneintrag im Hauptmen&uuml; finden.
          </p>
          <p>
            Mobilit&auml;tseingeschr&auml;nkte
            Personen finden mit &bdquo;TUW-maps&ldquo; leicht zu den
            barrierefreien Zugangsm&ouml;glichkeiten, Aufz&uuml;gen und , Rampen,
            und Sanit&auml;ranlagen, welche in den Darstellungen abgebildet sind.
          </p>
          <p>
            Ein Routingsystem
            zeigt Ihnen statisch einen m&ouml;glichen Weg zum
            Zielgeb&auml;ude/Zielraum.
          </p>
          <p>
            <b>Haftung</b>
          </p>
          <p>
            Dies ist die
            &szlig;-Version von TUW-maps!
          </p>
          <p>
            S&auml;mtliche Texte,
            Darstellung und Wege im Rahmen des digitalen Leitsystems &bdquo;TUW-maps&ldquo;
            wurden sorgf&auml;ltig gepr&uuml;ft. Dessen ungeachtet kann keine
            Garantie f&uuml;r die Richtigkeit, Vollst&auml;ndigkeit und
            Aktualit&auml;t der Angaben &uuml;bernommen werden.
          </p>
          <p>
            Eine Haftung der TU
            Wien und / bzw. des software-Herstellers (<a href="https://www.gomogi.com" target="_blank">GOMOGI</a> / Michael Diener)
            sind daherist ausgeschlossen. Im Zuge der Darstellung von Geb&auml;uden
            und Zugangsm&ouml;glichkeiten wird versucht, auf Einschr&auml;nkungen
            m&ouml;glichst aktuell hinzuweisen, wir bitten jedoch, stetsht&acute;s
            auf eventuelle Hindernisse und ge&auml;nderte Beschilderungen usw.,
            welche im Plan und den Routen noch nicht ersichtlich sind, zu achten!
            Vor Ort ersichtlichen Einschr&auml;nkungen/Hinweisen ist jedenfalls
            immer Folge zu leisten.
          </p>
          <p>
            Die <a href="https://www.tuwien.at" target="_blank">TU Wien</a> und
            <a href="https://www.gomogi.com" target="_blank">GOMOGI</a> / Michael Diener &uuml;bernehmen auch keinerlei Haftungen aus
            in Zusammenhang mit der Nutzung und Anwendung der sSoftware. Ebenso
            wenig wird keine Haftung f&uuml;r allf&auml;llige Sch&auml;den, die
            durch Nutzung der vorgeschlagenen Wege entstehen, &uuml;bernommen.
          </p>
          <p>
            Die Links zu anderen
            Webseiten wurden sorgf&auml;ltig ausgew&auml;hlt. Da die TU Wien auf
            deren Inhalt keinen Einfluss hat, &uuml;bernimmt die TU Wien daf&uuml;r
            auch keine Verantwortung.
          </p>
          <p>
            TUW-maps ist ein
            Projekt der TU Wien, eine allf&auml;llige weitergehende, insbesondere
            gewerbliche Nutzung der verwendeten Karten, Darstellungen usw. von
            TUW-maps bed&uuml;rfen bedarf der vorhergehenden schriftlichen
            Zustimmung durch die TU Wien.
          </p>
          <p>
            <b>Kontakt</b>
          </p>
          <p>
            Wir sind dankbar f&uuml;r
            Ihre Anregungen, Erg&auml;nzungen, und Korrekturen. Senden Sie diese
            bitte an: TUW-maps@gut.tuwien.ac.at <br>
            web Kontakt: <a href="https://www.tuwien.at/tu-wien/kontakt/" target="_blank">TU Wien</a>
            <br>
            <a href="https://www.tuwien.at/tu-wien/kontakt/impressum/" target="_blank">TU Wien Impressum </a>
          </p>
          <p>
            An <a href="https://www.indrz.com" target="_blank">indrz.com</a> project
            developed by <a href="https://www.gomogi.com" target="_blank">GOMOGI</a>
          </p>
        </div>
        <div>
          <p>
            <span lang="en-US"><b>Feedback
              bitte an:</b></span>
          </p>
          <p>
            <span lang="en-US">TUW-maps@gut.tuwien.ac.at

              (mailto: TUW-maps@gut.tuwien.ac.at).</span>
          </p>
          <p>
            <br>
          </p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Terms',

  props: {
    show: {
      type: Boolean,
      default: function () {
        return false;
      }
    }
  },
  data () {
    return {
      contact: this.$t('contact')
    };
  },
  computed: {
    dialog: {
      get: function () {
        return this.show;
      },
      set: function (newValue) {
        this.$emit('termsShow', newValue);
      }
    }
  }
};
</script>

<style scoped>

</style>
