class IamRoute extends DtbRoute {
    constructor() {
        super({
            state: 'iam',
            name: 'IAM',
            iconArea: new RcdGoogleMaterialIconArea('group').init()
        });
    }

    onDisplay() {
        this.retrieveIdProviders();
    }

    createBreadcrumbsLayout() {
        return new RcdMaterialBreadcrumbsLayout().init()
            .addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox').init().setStateRef(''))
            .addBreadcrumb(new RcdMaterialBreadcrumb('IAM').init())
            .addChild(new RcdGoogleMaterialIconArea('help', () => this.displayHelp()).init().setTooltip('Help'));
    }

    createLayout() {
        this.tableCard = new RcdMaterialTableCard('ID Providers', {selectable: false})
            .init()
            .addColumn('Key')
            .addColumn('Display Name')
            .addColumn('', {icon: true})
            .addColumn('', {icon: true});
        return new RcdMaterialLayout().init()
            .addChild(this.tableCard);
    }

    retrieveIdProviders() {
        const infoDialog = showShortInfoDialog('Retrieving ID provider list...');
        this.tableCard.deleteRows();
        return requestJson(config.servicesUrl + '/idprovider-list')
            .then((result) => {
                result.success.sort((idprovider1, idprovider2) => idprovider2.key - idprovider1.key)
                    .forEach((idprovider) => {

                        const displayUsers = () => setState('users', {
                            idprovider: idprovider.key
                        });
                        const displayGroups = () => setState('groups', {
                            idprovider: idprovider.key
                        });
                        const displayUsersIconArea = new RcdGoogleMaterialIconArea('person', (source, event) => {
                            displayUsers();
                            event.stopPropagation();
                        }).init()
                            .setTooltip('Display users');
                        const displayGroupsIconArea = new RcdGoogleMaterialIconArea('group', (source, event) => {
                            displayGroups();
                            event.stopPropagation();
                        }).init()
                            .setTooltip('Display groups');

                        this.tableCard.createRow({selectable: false})
                            .addCell(idprovider.key)
                            .addCell(idprovider.displayName)
                            .addCell(displayUsersIconArea, {icon: true})
                            .addCell(displayGroupsIconArea, {icon: true})
                            .setAttribute('key', idprovider.key);
                    });
            })
            .catch(handleRequestError)
            .finally(() => infoDialog.close());
    }

    displayHelp() {
        const fullName = 'Identity and Access Management';
        const definition = 'All users and groups are created and managed in ID providers. ' +
                           'Each Enonic XP installation has a System ID provider that cannot be deleted. ' +
                           'Additional id providers can be created as needed. ' +
                           'See <a class="rcd-material-link" href="https://developer.enonic.com/docs/xp/stable/iam">IAM</a> for more information.';

        const viewDefinition = 'This view lists in a table all the ID providers';
        new HelpDialog('IAM', [fullName, definition, viewDefinition]).init()
            .addActionDefinition({iconName: 'person', definition: 'Display the users for this ID provider'})
            .addActionDefinition({iconName: 'group', definition: 'Display the groups for this ID provider'})
            .open();
    }

}
