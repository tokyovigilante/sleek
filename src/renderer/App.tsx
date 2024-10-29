import React, { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import IpcComponent from './IpcRenderer';
import MatomoComponent from './Matomo';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';
import NavigationComponent from './Navigation';
import GridComponent from './Grid/Grid';
import SplashScreen from './SplashScreen';
import FileTabs from './Header/FileTabs';
import { darkTheme, lightTheme } from './Themes';
import DrawerComponent from './Drawer/Drawer';
import SearchComponent from './Header/Search/Search';
import DialogComponent from './Dialog/Dialog';
import Archive from './Archive';
import HeaderComponent from './Header/Header';
import ContextMenu from './ContextMenu';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './Settings/LanguageSelector';
import Settings from './Settings/Settings';
import Prompt from './Prompt';
import './App.scss';

window.settings = {
  cwd: '',
  name: 'config',
}

const settings = window.settings;

 // cwd: userDataDirectory,
 //  name: 'config',
 //  migrations: {
 //    '2.0.0': store => {
 //      console.log('Creating new default configuration for v2.0.0');
 //      store.set('sorting', [
 //        { id: '1', value: 'priority', invert: false },
 //        { id: '2', value: 'projects', invert: false },
 //        { id: '3', value: 'contexts', invert: false },
 //        { id: '4', value: 'due', invert: false },
 //        { id: '5', value: 't', invert: false },
 //        { id: '6', value: 'completed', invert: false },
 //        { id: '7', value: 'created', invert: false },
 //        { id: '8', value: 'rec', invert: false },
 //        { id: '9', value: 'pm', invert: false },
 //      ]);
 //      store.set('accordionOpenState', [
 //        true,
 //        true,
 //        true,
 //        false,
 //        false,
 //        false,
 //        false,
 //        false,
 //        false
 //      ]);
 //      store.set('files', []);
 //      store.set('appendCreationDate', false);
 //      store.set('showCompleted', true);
 //      store.set('showHidden', false);
 //      store.set('windowMaximized', false);
 //      store.set('fileSorting', false);
 //      store.set('convertRelativeToAbsoluteDates', true);
 //      store.set('thresholdDateInTheFuture', true);
 //      store.set('colorTheme', 'system');
 //      store.set('shouldUseDarkColors', false);
 //      store.set('notificationsAllowed', true);
 //      store.set('notificationThreshold', 2);
 //      store.set('showFileTabs', true);
 //      store.set('isNavigationOpen', true);
 //      store.set('customStylesPath', customStylesPath);
 //      store.set('tray', false);
 //      store.set('zoom', 100);
 //      store.set('multilineTextField', false);
 //      store.set('useMultilineForBulkTodoCreation', false);
 //      store.set('matomo', true);
 //    },
 //    '2.0.1': store => {
 //      console.log('Migrating from 2.0.0 → 2.0.1');
 //      store.set('anonymousUserId', crypto.randomUUID());
 //    },
 //    '2.0.2': store => {
 //      console.log('Migrating from 2.0.1 → 2.0.2');
 //      store.set('dueDateInTheFuture', true);
 //    },
 //    '2.0.4': store => {
 //      console.log('Migrating from 2.0.2 → 2.0.4');
 //      store.delete('multilineTextField');
 //      store.delete('isDrawerOpen');
 //      store.delete('useMultilineForBulkTodoCreation');
 //      store.set('bulkTodoCreation', false);
 //      store.set('disableAnimations', false);
 //    },
 //    '2.0.10': store => {
 //      console.log('Migrating from 2.0.4 → 2.0.10');
 //      store.set('useHumanFriendlyDates', false);
 //      store.set('excludeLinesWithPrefix', null);
 //    },
 //    '2.0.12': store => {
 //      console.log('Migrating from 2.0.11 → 2.0.12');
 //      store.set('channel', getChannel());
 //      store.set('fileWatcherAtomic', 1000);
 //      store.set('fileWatcherPolling', false);
 //      store.set('fileWatcherPollingInterval', 100);
 //    },
 //    '2.0.13': store => {
 //      console.log('Migrating from 2.0.12 → 2.0.13');
      // store.set('weekStart', 1);
 //      store.delete('fileWatcherAtomic');
 //      store.delete('fileWatcherPolling');
 //      store.delete('fileWatcherPollingInterval');
 //      store.delete('language');
 //      store.set('chokidarOptions', {
 //        awaitWriteFinish: {
 //          stabilityThreshold: 100,
 //          pollInterval: 100
 //        }
 //      })
 //    },
 //    '2.0.14': store => {
 //      console.log('Migrating from 2.0.13 → 2.0.14');
 //      store.set('menuBarVisibility', true);
 //    },
 //  }

const App = () => {
  // const [settings, setSettings] = useState<Settings>(store.getConfig());
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<AlertColor | undefined>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string | null>(null);
  const [todoData, setTodoData] = useState<TodoData | null>(null);
  const [todoObject, setTodoObject] = useState<TodoObject | null>(null);
  const [attributeFields, setAttributeFields] = useState<TodoObject | null>(null);
  const [headers, setHeaders] = useState<HeadersObject | null>(null);
  const [filters, setFilters] = useState<Filters | null>([]);
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [textFieldValue, setTextFieldValue] = useState<string>('');
  const [promptItem, setPromptItem] = useState<PromptItem | null>(null);
  const [triggerArchiving, setTriggerArchiving] = useState<boolean>(false);
  const searchFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSnackBarOpen(Boolean(snackBarContent));
  }, [snackBarContent]);

  useEffect(() => {
    if(settings.files?.length === 0) {
      setTodoData(null);
    }
  }, [settings.files]);

  useEffect( () =>  {
    i18n.changeLanguage(settings.language)
      .then(() => {
        console.log(`Language set to "${settings.language}"`);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [settings.language]);

  useEffect(() => {
    // ipcRenderer.send('requestData');
  }, []);

  return (
    <>
      <IpcComponent
        setHeaders={setHeaders}
        setAttributes={setAttributes}
        setFilters={setFilters}
        setTodoData={setTodoData}
        setTodoObject={setTodoObject}
        setAttributeFields={setAttributeFields}
        setSnackBarSeverity={setSnackBarSeverity}
        setSnackBarContent={setSnackBarContent}
        // setSettings={setSettings}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      {settings.matomo && (
        <MatomoComponent
          settings={settings}
        />
      )}
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={settings?.shouldUseDarkColors ? darkTheme : lightTheme}>
          <CssBaseline />
          <div className={`flexContainer ${settings?.isNavigationOpen ? '' : 'hideNavigation'} ${settings?.shouldUseDarkColors ? 'darkTheme' : 'lightTheme'} ${settings.disableAnimations ? 'disableAnimations' : ''}`}>
            <NavigationComponent
              setDialogOpen={setDialogOpen}
              settings={settings}
              setIsSettingsOpen={setIsSettingsOpen}
              setTodoObject={setTodoObject}
              headers={headers}
            />
            {settings?.files?.length > 0 && (
              <DrawerComponent
                settings={settings}
                attributes={attributes}
                filters={filters}
                searchFieldRef={searchFieldRef}
              />
            )}
            <div className="flexItems">
              {settings.files?.length > 0 && (
              <>
                {settings.showFileTabs ?
                <FileTabs
                  settings={settings}
                  setContextMenu={setContextMenu}
                 /> : null}
                {headers && headers.availableObjects > 0 ?
                <>
                  <SearchComponent
                    headers={headers}
                    searchString={searchString}
                    setSearchString={setSearchString}
                    settings={settings}
                    searchFieldRef={searchFieldRef}
                    setPromptItem={setPromptItem}
                  />
                  <HeaderComponent
                    settings={settings}
                    searchFieldRef={searchFieldRef}
                  />
                </>
                : null }
              </>
              )}
              {todoData && headers.availableObjects > 0 && (
                <>
                  <GridComponent
                    todoData={todoData}
                    setTodoObject={setTodoObject}
                    filters={filters}
                    setDialogOpen={setDialogOpen}
                    setContextMenu={setContextMenu}
                    setPromptItem={setPromptItem}
                    settings={settings}
                    headers={headers}
                    searchString={searchString}
                  />
                </>
              )}
              <SplashScreen
                setDialogOpen={setDialogOpen}
                setSearchString={setSearchString}
                headers={headers}
                settings={settings}
              />
            </div>
          </div>
          {dialogOpen ? (
            <DialogComponent
              todoObject={todoObject}
              setTodoObject={setTodoObject}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              attributes={attributes}
              attributeFields={attributeFields}
              setAttributeFields={setAttributeFields}
              setSnackBarSeverity={setSnackBarSeverity}
              setSnackBarContent={setSnackBarContent}
              textFieldValue={textFieldValue}
              setTextFieldValue={setTextFieldValue}
              settings={settings}
            />
          ) : null}
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
          />
          {contextMenu && (
            <ContextMenu
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              setPromptItem={setPromptItem}
            />
          )}
          <Snackbar
            open={snackBarOpen}
            onClose={() => setSnackBarContent(null)}
            autoHideDuration={3000}
          >
            <Alert 
              severity={snackBarSeverity}
              data-testid={`snackbar-${snackBarSeverity}`}
            >
              {snackBarContent}
            </Alert>
          </Snackbar>
          {settings?.files?.length > 0 && (
            <Archive
              triggerArchiving={triggerArchiving}
              setTriggerArchiving={setTriggerArchiving}
              settings={settings}
              setPromptItem={setPromptItem}
              headers={headers}
            />
          )}
          {promptItem && (
            <Prompt
              open={true}
              onClose={() => setPromptItem(null)}
              promptItem={promptItem}
              setPromptItem={setPromptItem}
              setContextMenu={setContextMenu}
            />
          )}
        </ThemeProvider>
      </I18nextProvider>
    </>
  );
};

export default App;
