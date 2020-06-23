<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-card>
      <v-card-title class="headline" />
      <v-card-text>
        <h1>Hilfe</h1>
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
            bitte an: TUW-maps@gut.tuwien.ac.at
            <a href="https://www.tuwien.at/tu-wien/kontakt/" target="_blank">TU Wien</a>
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
            <b>Sie startenStart</b>
          </p>
          <p>
            Die Karte zeigt
            s&auml;mtlichen Standorte der TU Wien im Stadtgebiet von Wien.
          </p>
          <p>
            Um auf der Karte zu
            navigieren, klicken Sie auf die Karte bzw. ziehen Sie die Karte an
            die gew&uuml;nschte Position. Um die Karte zu vergr&ouml;&szlig;ern
            oder zu verkleinern, k&ouml;nnen Sie entweder scrollen oder die
            Buttons +/- der Zoomleiste verwenden. Eine weitere M&ouml;glichkeit,
            um die Karte zu vergr&ouml;&szlig;ern, bietet ein Doppelklick auf die
            gew&uuml;nschte Position.
          </p>
          <p>
            <b>Sie suchen Suche</b>
          </p>
          <p>
            <img src="../static/images/tu-help/search.jpg" align="bottom">
          </p>
          <p>
            Um die Suchfunktion
            zu verwenden, geben Sie im Suchfeld mindestens drei Zeichen ein.
            Haben Sie zum Beispiel &bdquo;Bib&ldquo; eingegeben, werden in einer
            Liste automatisch alle Ergebnisse aufgelistet, welche mit &bdquo;Bib&ldquo;
            beginnen. Nachdem Sie ein Ergebnis aus der Liste ausgew&auml;hlt
            haben, wird das Ergebnis im Kartenfenster markiert.
          </p>
          <p style="margin-bottom: 0cm; line-height: 100%">
            <br>
          </p>
          <p>
            <b>Routing/Wegbeschreibung</b>
          </p>
          <p>
            <img src="../static/images/tu-help/routing.jpg" align="bottom">
          </p>
          <p>
            &Uuml;ber die
            Routingfunktion k&ouml;nnen Sie einen Start- und einen Endpunkt
            eingeben und sich den k&uuml;rzesten Weg berechnen und anzeigen
            lassen.
          </p>
          <p>
            Zus&auml;tzlich zur
            grafischen Darstellung auf der Karte wird eine Wegbeschreibung mit
            Angaben zur Wegstrecke angegeben. Sollte sich eine Route &uuml;ber
            mehrere Stockwerke erstrecken, wird die Route des aktiven Stockwerks
            dicker dargestellt als der Rest der Route. Befindet man sich
            beispielsweise im ersten Obergeschoss und
          </p>
          <p>
            generiert eine Route
            zum Haupteingang im Erdgeschoss, so wird die Route im ersten
            Obergescho&szlig; bis zum Stiegenhaus dicker dargestellt als der Teil
            vom Stiegenhaus zum Haupteingang. Setzt man das Erdgeschoss als
            aktives Stockwerk, so &auml;ndern sich die St&auml;rken der Linien.
          </p>
          <p>
            &gt; Wenn die Option
            &ldquo;Barrierefrei&ldquo; aktiviert ist, wird die Route nie &uuml;ber
            Stiegen gef&uuml;hrt, sondern eine barrierefreie Variante angezeigt!
          </p>
          <p>
            <b>POIs</b>
          </p>
          <p>
            <img src="../static/images/tu-help/poi.jpg" align="bottom">
          </p>
          <p>
            POIs&ldquo; -
            Points of Interest markieren allgemein interessante Punkte oderund
            Sehensw&uuml;rdigkeiten. Im linken Abschnitt neben der Karte sindeht
            man die aktuellen Hauptkategorien, in welche sich die &bdquo;Points
            of Interest&ldquo; gliedern, aufgelistet. Diese sind:
          </p>
          <ul>
            <li>
              <p>
                Zugang:
                beinhaltet alle Informationen, Eing&auml;nge und Parkm&ouml;glichkeiten
                (&ouml;ffentliche Verkehrsmittel, Radparkpl&auml;tze,
                E-Ladestationen usw.)
              </p>
            </li><li>
              <p>
                Lehre:
                beinhaltet alle Einrichtungen und Angebote der Lehre, insbesondere
                Lehrr&auml;ume, Institute und Bibliotheken
              </p>
            </li><li>
              <p>
                Einrichtungen:
                Sanit&auml;reinrichtungen aber auch Mensa / Verk&ouml;stigung und
                Lehrmittel
              </p>
            </li><li>
              <p>
                &Ouml;ffentliche
                Infrastruktur:
              </p>
            </li><li>
              <p>
                Sicherheit:
                beinhaltet, Portierslogen und Sicherheitsdienst,
                Erste-Hilfe-Einrichtungen, (Arbeitsmedizinischer Dienst (AMD), usw.
              </p>
            </li>
          </ul>
          <p>
            <br>
          </p>
          <p>
            Um ein Symbol ein-
            bzw. auszuschalten, klicken Sie auf dieses.ein Symbol. Wenn Sie eine
            Kategorie mit Sub-Kategorien ausw&auml;hlen, werden alle darunter
            liegenden Kategorien aktiviert.
          </p>
          <p>
            <b>Werkzeugleiste</b>
          </p>
          <p>
            <img src="../static/images/tu-help/share.jpg" alt="" align="bottom">
          </p>
          <p>
            Die Werkzeugleiste,
            welche &uuml;ber der Karte platziert ist, bietet Ihnen verschiedene
            M&ouml;glichkeiten und Funktionen: (folgende Beschreibung der Symbole
            von links nach rechts):
          </p>
          <p>
            <b>Download map as an
              imapge &ndash; Karte als Bild abspeichern</b>
          </p>
          <p>
            &Uuml;ber den Button
            &bdquo;Download &bdquo;Karte als Bildherunterladen&ldquo; / &bdquo;map
            as an imapge&ldquo; kann der aktuelle Gescho&szlig;plan als Bild
            abgespeichert werden.
          </p>
          <p>
            <b>Stockwerksauswahl</b>
          </p>
          <p>
            Diese Funktion
            erm&ouml;glicht es Ihnen, das gew&uuml;nschte Stockwerk zu aktivieren
            und im Kartenfenster anzuzeigen. Klicken Sie auf das gew&uuml;nschte
            Stockwerk (z.B. 4 = viertes Obergescho&szlig;), um die auf diesem
            Stockwerk liegenden R&auml;ume anzuzeigen.
          </p>
          <p>
            <img src="../static/images/tu-help/floor-changer.jpg" align="bottom">
          </p>
          <p>
            Durch Klick auf das
            Plus- oder das Minussymbol k&ouml;nnen Sie den Kartenausschnitt
            vergr&ouml;&szlig;ern oder verkleinern. Es k&ouml;nnen direkte Links
            zu R&auml;umen oder gewissen Punkten (&quot;POIs&quot;) erzeugt
            werden. Die Erzeugung dieser Links ist einfach. Sie m&uuml;ssen nur
            im Popup des Suchergebnisses auf den Teilen-Button klicken und die
            erzeugte Webadresse aus dem Feld kopieren. Bei POIs k&ouml;nnen
            sowohl einzelne POIs als auch POI-Kategorien verlinkt werden. Daf&uuml;r
            werden nach dem Klick auf den Teilen-Button zwei unterschiedliche
            URLs bereitgestellt. Falls mehrere POI-Kategorien gleichzeitig
            aufgerufen werden sollen, so kann dies durch Trennen der numerischen
            POI-Kategorien durch Beistriche in der URL erreicht werden.
          </p>
          <p>
            <b>ZOOM </b>
          </p>
          <p>
            <img src="../static/images/tu-help/zoom.jpg" align="bottom">
          </p>
          <p>
            Zus&auml;tzlich
            k&ouml;nnen Sie mit weiteren Parameter die Zoom-Stufe, das linke
            Men&uuml;, das horizontale Men&uuml; sowie die Anzeige des Footers
            beeinflussen:
          </p>
          <p>
            <br>
          </p>
          <p>
            <b>Links</b>
          </p>
          <p>
            Es ist auch m&ouml;glich,
            direkte Links auf bestimmte Routen zu erstellen. Dazu m&uuml;ssen Sie
            nur nach Erzeugung einer Route auf den Button &quot;Route teilen&quot;
            klicken und k&ouml;nnen aus dem darunterliegenden Textfeld den die
            URL f&uuml;r die Route kopieren. Wichtig ist dabei jedoch, dass der
            Start- und Endpunkt der Route (im URL: &quot;routeStart&quot; und
            &quot;routeEnd&quot;) eindeutig sind. F&uuml;r normale Routen wird
            automatisch der Parameter &quot;type=0&quot; anggeh&auml;ngt.
          </p>
          <p>
            <b>Barrierefreie </b>
          </p>
          <p>
            Barrierefreie Routen
            werden durch den Parameter &quot;type=1&quot; erzeugt.
          </p>
          <p>
            <span lang="en-US"><b>Feedback
              bitte an:</b></span>
          </p>
          <p>
            <span lang="en-US">TUW-maps@gut.tuwien.ac.at
              (mailto: TUW-maps@gut.tuwien.ac.at).</span>
          </p>
          <p lang="en-US">
            <br>
          </p>
          <p>
            <img src="" align="bottom">
            <!-- Wohin sollen diese Links zeigen? -->
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
  name: 'Help',

  props: {
    show: {
      type: Boolean,
      default: function () {
        return false
      }
    }
  },
  data () {
    return {}
  },
  computed: {
    dialog: {
      get: function () {
        return this.show;
      },
      set: function (newValue) {
        this.$emit('helpShow', newValue);
      }
    }
  }
}
</script>

<style scoped>

</style>
