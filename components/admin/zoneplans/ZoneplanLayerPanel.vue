<template>
  <v-list>
    <v-toolbar
      color="purple"
      dark
    >
      <v-icon>mdi-layers</v-icon>
      <v-spacer>
        <v-toolbar-title>Layers</v-toolbar-title>
      </v-spacer>
    </v-toolbar>
    <v-list-group
      :value="true"
      no-action
    >
      <template v-slot:activator>
        <v-list-item-icon>
          <v-icon small>
            mdi-account-group
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>All Organizations</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item
        v-for="([title, icon, iconColor], i) in allOrgs"
        :key="i"
        link
      >
        <v-list-item-action>
          <v-checkbox :input-value="active" />
        </v-list-item-action>
        <v-list-item-title v-text="title" />

        <v-list-item-icon>
          <v-icon :color="iconColor" v-text="icon" />
        </v-list-item-icon>
      </v-list-item>
    </v-list-group>
    <v-list-group
      :value="true"
      prepend-icon="mdi-office-building"
    >
      <template v-slot:activator>
        <v-list-item-title>Zoneplans</v-list-item-title>
      </template>

      <v-list-group
        :value="true"
        no-action
        sub-group
      >
        <template v-slot:activator>
          <v-list-item-icon>
            <v-icon small>
              mdi-account-group
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Organizations</v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item
          v-for="([title, icon, iconColor], i) in mainOrgs"
          :key="i"
          link
        >
          <v-list-item-action>
            <v-checkbox :input-value="active" />
          </v-list-item-action>
          <v-list-item-title v-text="title" />

          <v-list-item-icon>
            <v-icon :color="iconColor" v-text="icon" />
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>

      <v-list-group
        no-action
        sub-group
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Sub Org E100</v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item
          v-for="([title, icon, iconColor], i) in subOrgs"
          :key="i"
          link
        >
          <v-list-item-action>
            <v-checkbox :input-value="active" />
          </v-list-item-action>
          <v-list-item-title v-text="title" />
          <v-list-item-icon>
            <v-icon :color="iconColor" v-text="icon" />
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>
    </v-list-group>
    <v-list-group
      no-action
      prepend-icon="mdi-office-building"
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
          <v-checkbox :input-value="active" />
        </v-list-item-action>
        <v-list-item-title v-text="title" />
        <v-list-item-icon>
          <v-icon :color="iconColor" v-text="icon" />
        </v-list-item-icon>
      </v-list-item>
    </v-list-group>
    <v-divider inset />
    <v-treeview
      :multiple-active="multi"
      :items="items"
      selected-color="indigo"
      selectable
      item-key="id"
      dense
      style="overflow: auto; width: auto;"
    >
      <template v-slot:append>
        <v-icon color="blue">mdi-square</v-icon>
      </template>
    </v-treeview>
    <v-treeview
      selectable
      :items="items"
    />
    <template v-slot:prepend="{ item }">
      <v-icon v-if="!item.children">
        mdi-account
      </v-icon>
    </template>
  </v-list>
</template>

<script>

export default {
  data: () => ({
    mainOrgs: [
      ['E100', 'mdi-floor-plan', 'blue'],
      ['E200', 'mdi-floor-plan', 'green'],
      ['E300', 'mdi-floor-plan', 'green'],
      ['E600', 'mdi-floor-plan', 'green'],
      ['E900', 'mdi-floor-plan', 'green']
    ],
    subOrgs: [
      ['E100', 'mdi-floor-plan', 'blue'],
      ['E130', 'mdi-floor-plan', 'green'],
      ['E150', 'mdi-floor-plan', 'green'],
      ['E180', 'mdi-floor-plan', 'green']
    ],
    allOrgs: [
      ['E010R', 'mdi-floor-plan', 'blue'],
      ['E010V', 'mdi-floor-plan', 'green'],
      ['E014', 'mdi-floor-plan', 'red'],
      ['E100', 'mdi-floor-plan', 'yellow'],
      ['E130', 'mdi-floor-plan', 'grey'],
      ['E150', 'mdi-floor-plan', 'purple'],
      ['E180', 'mdi-floor-plan', 'pink'],
      ['E200', 'mdi-floor-plan', 'cyan'],
      ['E250', 'mdi-floor-plan', 'blue'],
      ['E300', 'mdi-floor-plan', 'blue'],
      ['E350', 'mdi-floor-plan', 'blue'],
      ['E600', 'mdi-floor-plan', 'blue'],
      ['E610', 'mdi-floor-plan', 'blue'],
      ['E620', 'mdi-floor-plan', 'blue'],
      ['E630', 'mdi-floor-plan', 'blue'],
      ['E640', 'mdi-floor-plan', 'blue'],
      ['E936', 'mdi-floor-plan', 'blue']
    ],
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
      ['', 'mdi-square', 'orange']
    ],
    items: [
      {
        id: 1,
        name: 'Organizations :',
        icon: 'mdi-account-group',
        children: [
          { id: 2, name: 'E100', icon: 'mdi-square' },
          { id: 3, name: 'E200', icon: 'mdi-square' },
          { id: 4, name: 'E300', icon: 'mdi-square' }
        ]
      },
      {
        id: 5,
        name: 'Usage Types :',
        icon: 'mdi-square',
        children: [
          {
            id: 6,
            icon: 'mdi-square',
            name: '2.1 Büroräume :'
          }
        ]
      }
    ]
  })
}
</script>
<style scoped>
.label_align {
  text-align: left;
}
</style>
