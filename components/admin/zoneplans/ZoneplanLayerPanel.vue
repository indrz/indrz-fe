<template>
  <v-list>
    <v-toolbar
      color="purple"
      dark
    >
      <v-icon>mdi-layers</v-icon>
      <v-spacer>
        <v-toolbar-title>Map Layers</v-toolbar-title>
      </v-spacer>
    </v-toolbar>
    <v-list-group no-action prepend-icon="mdi-office-building">
      <template v-slot:activator>
        <v-list-item-content>
          <v-list-item-title>Organization</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item v-for="org in organizations" :key="org.id" link>
        <v-list-item-action>
          <v-checkbox :value="org.active" @change="toggleLayer(org)" />
        </v-list-item-action>
        <!-- Wrap the title and subtitle in v-list-item-content -->
        <v-list-item-content>
          <v-list-item-title v-text="org.orgcode" />
          <v-list-item-subtitle v-text="org.name" />
        </v-list-item-content>

        <v-list-item-icon>
          <v-icon :color="org.color" v-text="org.icon" />
        </v-list-item-icon>
      </v-list-item>
    </v-list-group>
    <v-list-group
      no-action
      prepend-icon="mdi-file-table-box-outline"
    >
      <template v-slot:activator>
        <v-list-item-content>
          <v-list-item-title>Usage Types</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item
        v-for="([title, icon, iconColor], i) in spaceTypes"
        :key="i"
        link
      >
        <v-list-item-action>
          <v-checkbox />
        </v-list-item-action>
        <v-list-item-title v-text="title" />
        <v-list-item-icon>
          <v-icon :color="iconColor" v-text="icon" />
        </v-list-item-icon>
      </v-list-item>
    </v-list-group>
  </v-list>
</template>

<script>

import axios from 'axios';

export default {
  data: () => ({
    organizations: [],
    spaceTypes: [
      ['1.2 Gemeinschaftsräume', 'mdi-square', 'green'],
      ['1.4 Warteräume', 'mdi-square', 'green'],
      ['1.5 Speiseräume', 'mdi-square', 'green'],
      ['2.1 Büroräume', 'mdi-square', 'orange'],
      ['2.2 Grossraumbüros', 'mdi-square', 'orange'],
      ['2.3 Besprechungsräume', 'mdi-square', 'orange'],
      ['2.4 Konstruktionsräume', 'mdi-square', 'orange'],
      ['2.6 Bedienungsräume', 'mdi-square', 'orange'],
      ['2.7 Aufsichtsräume', 'mdi-square', 'orange'],
      ['2.8 Bürotechnikräume', 'mdi-square', 'orange'],
      ['3.1 Werkhallen', 'mdi-square', 'blue'],
      ['3.2 Werkstätten', 'mdi-square', 'blue'],
      ['3.3 Technologische Labors', 'mdi-square', 'blue'],
      ['3.4 Physikalische, physikalisch- technische, elektrotechnische Labors', 'mdi-square', 'blue'],
      ['3.5 Chemische, bakteriologische, morphologische Labors', 'mdi-square', 'blue'],
      ['3.8 Küchen', 'mdi-square', 'blue'],
      ['3.9 Sonderarbeitsräume', 'mdi-square', 'blue'],
      ['4.1 Lagerräume', 'mdi-square', 'grey'],
      ['4.2 Archive, Sammlungsräume', 'mdi-square', 'grey'],
      ['4.3 Kühlräume', 'mdi-square', 'grey'],
      ['4.4 Annahme- und Ausgaberäume', 'mdi-square', 'grey'],
      ['4.5 Verkaufsräume', 'mdi-square', 'grey'],
      ['5.1 Unterrichtsräume mit festem Gestühl', 'mdi-square', 'orange'],
      ['5.2 Allgemeine Unterrichts- und Übungsräume ohne festes Gestühl', 'mdi-square', 'orange'],
      ['5.3 Besondere Unterrichts- und Übungsräume ohne festes Gestühl', 'mdi-square', 'orange'],
      ['5.4 Bibliotheksräume', 'mdi-square', 'orange'],
      ['5.6 Versammlungsräume', 'mdi-square', 'orange'],
      ['5.7 Bühnen-, Studioräume', 'mdi-square', 'orange'],
      ['6.1 Räume mit allgemeiner medizinischer Ausstattung', 'mdi-square', 'orange'],
      ['7.1 Sanitärräume', 'mdi-square', 'orange'],
      ['7.2 Garderoben', 'mdi-square', 'orange'],
      ['7.3 Abstellräume', 'mdi-square', 'orange'],
      ['7.4 Fahrzeugabstellflächen', 'mdi-square', 'orange'],
      ['7.6 Räume für zentrale Technik', 'mdi-square', 'orange'],
      ['7.7 Schutzräume', 'mdi-square', 'orange'],
      ['7.9 Sonstige Räume', 'mdi-square', 'orange'],
      ['8.1 Abwasseraufbereitung und -beseitigung Wasserversorgung', 'mdi-square', 'orange'],
      ['8.2 Heizung und Brauchwassererwärmung', 'mdi-square', 'orange'],
      ['8.3 Raumlufttechnische Anlagen', 'mdi-square', 'orange'],
      ['8.4 Elektrische Stromversorgung', 'mdi-square', 'orange'],
      ['8.5 Fernmeldetechnik', 'mdi-square', 'orange'],
      ['8.6 Aufzugs- und Förderanlagen', 'mdi-square', 'orange'],
      ['8.7 Gase (außer für Heizzwecke) und Flüssigkeiten', 'mdi-square', 'orange'],
      ['8.8 Schächte', 'mdi-square', 'orange'],
      ['8.9 Sonstige betriebstechnische Anlagen', 'mdi-square', 'orange'],
      ['9.1 Flure, Hallen', 'mdi-square', 'orange'],
      ['9.2 Treppen', 'mdi-square', 'orange'],
      ['9.3 Schächte für Förderanlagen', 'mdi-square', 'orange'],
      ['9.4 Fahrzeugverkehrsflächen', 'mdi-square', 'orange'],
      ['9.9 Sonstige Verkehrsflächen', 'mdi-square', 'orange'],
      ['', 'mdi-square', 'grey']
    ]
  }),

  // Fetch organization codes when component is created
  created () {
    this.fetchOrganizationCodes();
  },
  mounted () {},
  methods: {

    async fetchOrganizationCodes () {
      const apiURL = 'http://localhost/api/v1/orgcode/'; // Replace with the actual API URL

      // If the token is stored in local storage or some state management
      // const token = localStorage.getItem('token'); // or however you store your token

      const axiosInstance = axios.create({
        baseURL: apiURL,
        headers: {
          Authorization: 'Token 449dacbbc14522dc7c0888e7fdf31a3bdc677bf3' // Assuming you are using token-based auth
        }
      });

      try {
        const response = await axiosInstance.get();
        this.organizations = response.data;
      } catch (error) {
        this.error = error.response ? error.response.data : error.message;
      }
    },
    toggleLayer (layer) {
      layer.active = !layer.active;
      console.log('toggleLayer', layer);
      this.$emit('layer-toggled', { name: layer.name, orgcode: layer.orgcode, active: layer.active, color: layer.color });
    }
  }

}
</script>
<style scoped>
.label_align {
  text-align: left;
}
</style>
