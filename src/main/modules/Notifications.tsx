import crypto from 'crypto';
import { Notification } from 'electron';
import { config, filter, notifiedTodoObjectsStorage } from '../config';
import { checkForSearchMatches } from './ProcessDataRequest/ProcessTodoObjects';
import dayjs, { Dayjs } from "dayjs";
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isBetween);


function sendNotification(title: string, body: string) {
  const options = {
    title,
    body,
    silent: false,
  };
  const notification = new Notification(options);
  notification.show();
}

function createSpeakingDifference(dueDate: Dayjs) {
  const today = dayjs();
  const daysUntilDue: number = dueDate.diff(today, 'day') + 1;
  if(dayjs(dueDate).isToday()) return 'Due today';
  if(dayjs(dueDate).isTomorrow()) return 'Due tomorrow';
  if(daysUntilDue > 1) return `Due in ${daysUntilDue} days`;
  return 'Due';
}

function handleNotification(due: string | null, body: string, badge: Badge) {
  const notificationAllowed = config.get('notificationsAllowed');
  
  if(notificationAllowed) {
    const today = dayjs().startOf('day');
    const todayString = today.format('YYYY-MM-DD');
    const dueDate = dayjs(due, 'YYYY-MM-DD');
    const notificationThreshold: number = config.get('notificationThreshold');
    const hash = todayString + crypto.createHash('sha256').update(body).digest('hex');
    const searchFilters: SearchFilter[] = filter.get('search') || [];
    
    let searchFilterMatch;
    for (const searchFilter of searchFilters) {
      if (searchFilter.notify && searchFilter.label) {
        const match = checkForSearchMatches(body, searchFilter.label);
        if (match) {
          searchFilterMatch = {
            label: searchFilter.label,
          };
          break;
        }
      }
    }
        
    let title: string;
    if(dueDate.isToday() || dueDate.isBetween(today, today.add(notificationThreshold, 'day'))) {
      title = createSpeakingDifference(dueDate)
    } else if(searchFilterMatch && searchFilterMatch.label) {
      title = `Matched "${searchFilterMatch.label}"`;
    } else {
      return;
    }

    badge.count += 1;
    const notifiedTodoObjects = new Set<string>(notifiedTodoObjectsStorage.get('notifiedTodoObjects', []));
    if(!notifiedTodoObjects.has(hash)) {
      sendNotification(title, body);
      notifiedTodoObjects.add(hash);
      notifiedTodoObjectsStorage.set('notifiedTodoObjects', Array.from(notifiedTodoObjects));
    }
  }
}

export { sendNotification, handleNotification }
