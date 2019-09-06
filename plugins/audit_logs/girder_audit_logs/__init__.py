import cherrypy
import datetime
import logging
import six
from six.moves import urllib
from girder import auditLogger
from girder.models.model_base import Model
from girder.api.rest import getCurrentUser
from girder.plugin import GirderPlugin


class Record(Model):
    def initialize(self):
        self.name = 'audit_log_record'
        self.ensureIndices(['type', 'when'])

    def validate(self, doc):
        return doc


class _AuditLogDatabaseHandler(logging.Handler):
    def handle(self, record):
        user = getCurrentUser()

        if record.msg == 'rest.request':
            # Some characters may not be stored as MongoDB Object keys
            # https://docs.mongodb.com/manual/core/document/#field-names
            # RFC3986 technically allows such characters to be encoded in the query string, and
            # 'params' also contains data from form bodies, which may contain arbitrary field names
            # For MongoDB, '\x00', '.', and '$' must be encoded, and for invertibility, '%' must be
            # encoded too, but just encode everything for simplicity
            record.details['params'] = {
                # 'urllib.parse.quote' alone doesn't replace '.'
                urllib.parse.quote(paramKey, safe='').replace('.', '%2E'): paramValue
                for paramKey, paramValue in six.viewitems(record.details['params'])
            }
        Record().save({
            'type': record.msg,
            'details': record.details,
            'ip': cherrypy.request.remote.ip,
            'userId': user and user['_id'],
            'when': datetime.datetime.utcnow()
        }, triggerEvents=False)


class AuditLogsPlugin(GirderPlugin):
    DISPLAY_NAME = 'Audit logging'

    def load(self, info):
        auditLogger.addHandler(_AuditLogDatabaseHandler())
