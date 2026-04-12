# MCR file header: scripts\add_file_purpose_comments.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.

from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]

# Simple purpose mapping based on path patterns
PURPOSE_MAP = {
    'Backend/config/settings.py': 'Django project settings, environment configuration, and feature toggles.',
    'Backend/config/urls.py': 'Main API URL routing for the Django project.',
    'Backend/config/asgi.py': 'ASGI application entrypoint for async deployment.',
    'Backend/config/wsgi.py': 'WSGI application entrypoint for traditional deployment.',
    'Backend/manage.py': 'Django management CLI bootstrapper for running server, migrations, and commands.',
    'Backend/mcr/models.py': 'Django ORM models defining the MCR domain data structure.',
    'Backend/mcr/serializers.py': 'DRF serializers mapping MCR models to JSON payloads.',
    'Backend/mcr/views.py': 'API viewsets and handlers for MCR review operations.',
    'Backend/mcr/urls.py': 'App-specific URL routing for MCR API endpoints.',
    'Backend/mcr/tests.py': 'Automated tests for the MCR application behaviors.',
    'Frontend/src/App.tsx': 'Root React component wiring page routing and layout.',
    'Frontend/src/main.tsx': 'Application bootstrap that mounts the React app to the DOM.',
    'Frontend/src/router/config.tsx': 'Route definitions and page mappings for the frontend.',
    'Frontend/src/router/index.ts': 'Router provider setup for navigation and location.',
    'Frontend/src/providers/QueryProvider.tsx': 'TanStack Query provider setup for API caching and fetching.',
    'Frontend/src/i18n/index.ts': 'Internationalization initialization for language detection and translation resources.',
    'Frontend/src/i18n/local/index.ts': 'Local translation message bundles for supported languages.',
    'Frontend/src/components/DatePickerInput.tsx': 'Reusable date picker component for forms and filters.',
    'Frontend/src/components/DropdownSelect.tsx': 'Reusable dropdown select input UI component.',
    'Frontend/src/components/RagBadge.tsx': 'RAG status badge component for visual severity indicators.',
}

# Default mapping by directory or filename fragments
DEFAULT_MAP = [
    ('Backend/mcr/migrations', 'Database migration for the MCR app schema.'),
    ('Backend/mcr', 'MCR Django app source code.'),
    ('Backend/config', 'Django project configuration files.'),
    ('Frontend/src/pages/mcr-dashboard/components', 'Dashboard UI components for the MCR app.'),
    ('Frontend/src/pages/mcr-review-detail/components', 'Review detail page components for MCR.'),
    ('Frontend/src/pages/mcr-reviews/components', 'Review list page components for MCR.'),
    ('Frontend/src/pages/mcr-dashboard', 'Dashboard page and components for MCR metrics.'),
    ('Frontend/src/pages/mcr-review-detail', 'Review detail page logic and layout.'),
    ('Frontend/src/pages/mcr-reviews', 'Review list page logic and layout.'),
    ('Frontend/src/pages/mcr-review-print', 'Printable review export page.'),
    ('Frontend/src/utils', 'Utility helpers for API calls, data transformation, and exports.'),
    ('Frontend/src/types', 'TypeScript type definitions for MCR domain models.'),
    ('Frontend/src/mocks', 'Mock data used for development and UI previews.'),
    ('Frontend/src', 'Frontend source code for the MCR application.'),
]

EXT_COMMENT = {'.py': '#', '.ts': '//', '.tsx': '//', '.js': '//', '.jsx': '//', '.d.ts': '//'}

changed = 0
skipped = 0
for path in sorted(root.rglob('*')):
    if not path.is_file():
        continue
    if path.suffix not in EXT_COMMENT and not path.name.endswith('.d.ts'):
        continue
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines(keepends=True)
    if len(lines) >= 2 and 'MCR file header:' in lines[0] and 'This file is part of the MCR application source.' in lines[1]:
        # Already has header, may add purpose if missing
        if len(lines) >= 3 and 'Purpose:' in lines[2]:
            skipped += 1
            continue
        comment = EXT_COMMENT.get(path.suffix, '//')
        rel = str(path.relative_to(root)).replace('/', '\\')
        purpose = PURPOSE_MAP.get(rel)
        if not purpose:
            for fragment, default_purpose in DEFAULT_MAP:
                if fragment in rel:
                    purpose = default_purpose
                    break
        if not purpose:
            purpose = 'Source file for the MCR application.'
        header = f"{comment} MCR file header: {rel}\n{comment} This file is part of the MCR application source.\n{comment} Purpose: {purpose}\n\n"
        lines[0:2] = [header]
        path.write_text(''.join(lines), encoding='utf-8')
        changed += 1
    else:
        # If no existing header, add complete header
        comment = EXT_COMMENT.get(path.suffix, '//')
        rel = str(path.relative_to(root)).replace('/', '\\')
        purpose = PURPOSE_MAP.get(rel)
        if not purpose:
            for fragment, default_purpose in DEFAULT_MAP:
                if fragment in rel:
                    purpose = default_purpose
                    break
        if not purpose:
            purpose = 'Source file for the MCR application.'
        header = f"{comment} MCR file header: {rel}\n{comment} This file is part of the MCR application source.\n{comment} Purpose: {purpose}\n\n"
        lines.insert(0, header)
        path.write_text(''.join(lines), encoding='utf-8')
        changed += 1

print(f'Updated headers with purpose comments in {changed} files, skipped {skipped} files already containing a purpose line.')
