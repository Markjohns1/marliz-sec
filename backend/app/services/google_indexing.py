import logging
import httplib2
from googleapiclient.discovery import build
from oauth2client.service_account import ServiceAccountCredentials
import os
from app.config import settings

logger = logging.getLogger(__name__)

class GoogleIndexingService:
    def __init__(self):
        self.scopes = ["https://www.googleapis.com/auth/indexing"]
        self.endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
        self.key_file = os.path.join(os.path.dirname(__file__), "../../google-indexing-key.json")
        self._credentials = None

    @property
    def is_setup(self):
        """Check if the service account key exists"""
        return os.path.exists(self.key_file)

    async def notify_url_update(self, url: str):
        """
        Notifies Google that a URL has been updated or created.
        Requires google-indexing-key.json in the backend root.
        """
        if not self.is_setup:
            logger.warning("Google Indexing API key missing. Skipping notification.")
            return {"status": "skipped", "message": "Key file missing"}

        try:
            credentials = ServiceAccountCredentials.from_json_keyfile_name(
                self.key_file, 
                scopes=self.scopes
            )
            http = credentials.authorize(httplib2.Http())
            service = build("indexing", "v3", http=http)

            body = {
                "url": url,
                "type": "URL_UPDATED"
            }

            result = service.urlNotifications().publish(body=body).execute()
            logger.info(f"Successfully notified Google of URL update: {url}")
            return {"status": "success", "data": result}
        except Exception as e:
            logger.error(f"Failed to notify Google Indexing API: {e}")
            return {"status": "error", "message": str(e)}

google_indexing = GoogleIndexingService()
